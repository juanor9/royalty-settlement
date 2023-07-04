import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as fs from "fs";
import * as xml2js from "xml2js";
import { Decimal } from "decimal.js";
import ExcelJS from "exceljs";

// Crear una interfaz readline para leer desde la consola
const rl = readline.createInterface({ input, output });

// Preguntar al usuario el autor para la liquidación de regalías
const author = await rl.question(
  "¿A qué autor quieres hacer la liquidación de regalías? "
);

// Preguntar al usuario los ISBN de los libros para liquidar regalías
const bookListString = await rl.question(
  "Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,). "
);
const bookList = bookListString.split(",").map((book) => book.trim());

const percentages = {};

// Obtener el porcentaje de regalías para cada libro
for (const book of bookList) {
  const percentage = await rl.question(
    `Ingrese el porcentaje de regalías para el libro ${book}. Por favor escribe solo el número sin el signo %: `
  );
  const decimalPercentage = percentage;
  percentages[book] = decimalPercentage;
}

rl.close();

// Analizar los archivos XML
const path = "./xml-billing";

// Obtener la lista de archivos en el directorio
const files = await fs.promises.readdir(path);
// Filtrar los archivos para obtener solo los archivos XML
const allFilesPath = files.map((file) => {
  const filePath = `${path}/${file}`;
  const extension = file.split(".")[1];
  if (extension === "xml") {
    return filePath;
  } else {
    return null;
  }
});
const xmlFilesPath = allFilesPath.filter((file) => file !== null);

// Obtener los datos de los libros de los archivos XML
const bookListData = await Promise.all(
  bookList.map(async (book) => {
    const xmlFiles = await Promise.all(
      xmlFilesPath.map(async (file) => {
        const xmlBuffer = await fs.promises.readFile(file);
        const xmlString = xmlBuffer.toString("utf-8");

        // Analizar el contenido XML utilizando xml2js
        const fullXmlContent = await new Promise((resolve, reject) => {
          xml2js.parseString(xmlString, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        // Obtener la descripción de los datos desde el XML
        const dataDescriptionString =
          fullXmlContent.AttachedDocument["cac:Attachment"][0][
            "cac:ExternalReference"
          ][0]["cbc:Description"][0];
        const dataDescription = await new Promise((resolve, reject) => {
          xml2js.parseString(dataDescriptionString, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        // Obtener los elementos del XML que representan los libros
        const itemsXml = dataDescription.Invoice["cac:InvoiceLine"];
        const itemsArray = itemsXml.map((item) => {
          const code =
            item["cac:Item"][0]["cac:StandardItemIdentification"][0][
              "cbc:ID"
            ][0]["_"];
          const InvoiceId =
            fullXmlContent.AttachedDocument["cbc:ParentDocumentID"][0];
          const bookName = item["cac:Item"][0]["cbc:Description"][0];
          const unitPrice = Number(
            item["cac:Price"][0]["cbc:PriceAmount"][0]["_"]
          );
          const ammount = Number(item["cbc:InvoicedQuantity"][0]["_"]);

          const billed = ammount * unitPrice;
          const royaltiesPercentage = percentages[book];
          const royaltiesForCalculations = Decimal(royaltiesPercentage)
            .div(100)
            .toNumber();

          if (code === book) {
            const royaltyLine = {
              id: InvoiceId,
              isbn: code,
              book: bookName,
              PVP: unitPrice,
              ammount,
              billed,
              royalties: royaltiesForCalculations,
              payedRoyalties: Decimal(billed)
                .mul(royaltiesForCalculations)
                .toNumber(),
            };
            return royaltyLine;
          }
        });
        const cleanItemsArray = itemsArray.filter((item) => item !== undefined);

        return cleanItemsArray;
      })
    );

    const cleanXmlFiles = xmlFiles.filter((item) => item.length > 0).flat();

    return cleanXmlFiles;
  })
);

console.log("🚀 ~ file: index.js:44 ~ bookListData:", bookListData);

// Imprimir información sobre el autor, los libros y las ventas
console.log(`Autor: ${author}`);
console.log("Libros:");
for (const book in percentages) {
  console.log(`- ${book}: ${percentages[book]}%`);
}
console.log("Ventas:");
console.log(bookListData);

// Crear una interfaz readline para leer desde la consola
const csv = readline.createInterface({ input, output });

// Preguntar al usuario si desea generar un archivo de Excel con la información
const generateCSV = await csv.question(
  "¿Quieres generar un archivo de Excel con esta información? (y/n)"
);

csv.close();

// Función para crear un archivo de Excel con la información de ventas
const createExcel = async (sales) => {
  function dateToSlug(date) {
    // Función para convertir una fecha en un formato de slug
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const slug = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
    return slug.toLowerCase();
  }

  const dateHour = dateToSlug(new Date());

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("liquidación");

  // Configurar las columnas del archivo de Excel
  worksheet.columns = [
    {
      header: "Id de factura",
      key: "id",
      width: 12,
    },
    {
      header: "ISBN",
      key: "isbn",
      width: 15,
      style: {
        numFmt: "0",
      },
    },
    {
      header: "Libro",
      key: "book",
      width: 30,
    },
    {
      header: "PVP",
      key: "PVP",
      width: 10,
      style: {
        numFmt: '"$"#,##0.00',
      },
    },
    {
      header: "Ejemplares vendidos",
      key: "ammount",
      width: 19,
    },
    {
      header: "Total facturado",
      key: "billed",
      width: 14,
      style: {
        numFmt: '"$"#,##0.00',
      },
    },
    {
      header: "Porcentaje de regalías",
      key: "royalties",
      width: 20,
      style: {
        numFmt: "0%",
      },
    },
    {
      header: "Regalías generadas",
      key: "payedRoyalties",
      width: 18,
      style: {
        numFmt: '"$"#,##0.00',
      },
    },
  ];

  // Agregar filas al archivo de Excel con los datos de ventas
  sales.forEach((item) => {
    worksheet.addRows(item);
    worksheet.addRow(" ");
  });

  // Guardar el archivo de Excel
  await workbook.xlsx.writeFile(
    `./excel-files/${author}-royalties-${dateHour}.xlsx`
  );
};

// Verificar si el usuario desea generar el archivo de Excel
if (
  generateCSV === "y" ||
  generateCSV === "yes" ||
  generateCSV === "si" ||
  generateCSV === "sí"
) {
  createExcel(bookListData);
  console.log("Se generó el archivo");
} else {
  console.log("No se generará el archivo");
}

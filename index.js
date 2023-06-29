import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as fs from "fs";
import * as xml2js from "xml2js";
import { type } from "node:os";

const rl = readline.createInterface({ input, output });

// const author = await rl.question(
//   "¿A qué autor quieres hacer la liquidación de regalías? "
// );
const bookListString = await rl.question(
  "Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,). "
);
const bookList = bookListString.split(",").map((book) => book.trim());

// const percentages = {};

// for (const book of bookList) {
//   const percentage = await rl.question(`Ingrese el porcentaje de regalías para el libro ${book}. Por favor escribe solo el número sin el signo %: `);
//   percentages[book] = percentage;
// };

rl.close();

// Analizar xml
const path = "./xml-billing";

const files = await fs.promises.readdir(path); //Lista de todos los archivos en path
const allFilesPath = files.map((file) => {
  const filePath = `${path}/${file}`;
  const extension = file.split(".")[1];
  if (extension === "xml") {
    return filePath;
  } else {
    return null;
  }
});
const xmlFilesPath = allFilesPath.filter((file) => file !== null); // Lista de ruta de todos los archivos xml

const xmlFilesData = await Promise.all(
  xmlFilesPath.map(async (file) => {
    const xmlBuffer = await fs.promises.readFile(file);
    const xmlString = xmlBuffer.toString("utf-8");

    const fullXmlContent = await new Promise((resolve, reject) => {
      // Devuelve un objeto con toda la informacion del archivo xml
      xml2js.parseString(xmlString, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const dataDescriptionString =
      fullXmlContent.AttachedDocument["cac:Attachment"][0][
        "cac:ExternalReference"
      ][0]["cbc:Description"][0]; // Devuelve un string con el xml de la descripcion de la factura
    const dataDescription = await new Promise((resolve, reject) => {
      // Devuelve un objeto con toda la informacion de la descripcion archivo xml
      xml2js.parseString(dataDescriptionString, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    const itemsXml = dataDescription.Invoice["cac:InvoiceLine"];
    const itemsArray = itemsXml.map((item) => {
      const code =
        item["cac:Item"][0]["cac:StandardItemIdentification"][0]["cbc:ID"][0][
          "_"
        ];

      for (const book of bookList) {
        if (code === book) {
          const InvoiceId = fullXmlContent.AttachedDocument["cbc:ParentDocumentID"][0];
          const bookName = item["cac:Item"][0]["cbc:Description"][0];
          const unitPrice = Number(
            item["cac:Price"][0]["cbc:PriceAmount"][0]["_"]
          );
          const ammount = Number(item["cbc:InvoicedQuantity"][0]["_"]);

          const royaltyLine = {
            'Id': InvoiceId,
            'ISBN': code,
            'Libro': bookName,
            'PVP': unitPrice,
            'Ejemplares': ammount,
            'Total facturado': ammount * unitPrice
          }
          return royaltyLine;
        } else {
          return;
        }
      }
    });

    return itemsArray;
  })
);
const invoicesData = xmlFilesData.flatMap((e) => e).filter((e) => e !== undefined);
console.log("🚀 ~ file: index.js:97 ~ invoicesData:", invoicesData)

// console.log(`Autor: ${author}`);
// console.log('Libros:')
// for (const book in percentages) {
//   console.log(`- ${book}: ${percentages[book]}%`);
// }

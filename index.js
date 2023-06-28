import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as fs from "fs";
import * as xml2js from "xml2js";

// const rl = readline.createInterface({ input, output });

// const author = await rl.question(
//   "¿A qué autor quieres hacer la liquidación de regalías? "
// );
// const bookListString = await rl.question(
//   "Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,). "
// );
// const bookList = bookListString.split(",").map((book) => book.trim());

// const percentages = {};

// for (const book of bookList) {
//   const percentage = await rl.question(`Ingrese el porcentaje de regalías para el libro ${book}. Por favor escribe solo el número sin el signo %: `);
//   percentages[book] = percentage;
// };

// rl.close();

// Analizar xml
const path = "./xml-billing";

const files = await fs.promises.readdir(path);
// console.log("🚀 ~ file: index.js:31 ~ files:", files)
files.forEach(async (file) => {
  const extension = file.split(".")[1];
  if (extension !== "xml") {
    return; // Ignorar archivos que no sean XML
  }
  const filePath = `${path}/${file}`;

  // console.log("🚀 ~ file: index.js:39 ~ filePath:", filePath)

  const content = await fs.promises.readFile(filePath, "utf-8");
  const result = await new Promise((resolve, reject) => {
    xml2js.parseString(content, (err, result) => {
      // Analizar el contenido XML
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

  const FeDataDescription =
    result.AttachedDocument["cac:Attachment"][0]["cac:ExternalReference"][0][
      "cbc:Description"
    ][0];

  const FeDataDescriptionResult = await new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(FeDataDescription, (err, result) => {
      // Analizar la descripción de los datos adjuntos
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  const FeId = result.AttachedDocument["cbc:ParentDocumentID"][0];
  const itemXml = FeDataDescriptionResult.Invoice["cac:InvoiceLine"];

  const itemsArr = itemXml.map((item) => {
    const ammount = Number(item["cbc:InvoicedQuantity"][0]["_"]);
    const bookName = item["cac:Item"][0]["cbc:Description"][0];
    const code =
      item["cac:Item"][0]["cac:StandardItemIdentification"][0]["cbc:ID"][0][
        "_"
      ];
    const unitPrice = Number(item["cac:Price"][0]["cbc:PriceAmount"][0]["_"]);

    const itemData = {
      FeId: FeId,
      ammount: ammount,
      name: bookName,
      code: code,
      unitPrice: unitPrice,
      totalPrice: unitPrice * ammount,
    };
    return itemData;
  });
  console.log("🚀 ~ file: index.js:89 ~ itemsArr ~ itemsArr:", itemsArr)
});

// console.log(`Autor: ${author}`);
// console.log('Libros:')
// for (const book in percentages) {
//   console.log(`- ${book}: ${percentages[book]}%`);
// }

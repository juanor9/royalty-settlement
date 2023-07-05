import * as fs from "fs";
import * as xml2js from "xml2js";
import { Decimal } from "decimal.js";

const xmlAnalizer = async (path, bookList, percentages) => {
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
            const invoiceDate = dataDescription.Invoice["cbc:IssueDate"][0];
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
                date: invoiceDate,
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
          const cleanItemsArray = itemsArray.filter(
            (item) => item !== undefined
          );

          return cleanItemsArray;
        })
      );

      const cleanXmlFiles = xmlFiles.filter((item) => item.length > 0).flat();

      return cleanXmlFiles;
    })
  );

  return bookListData;
};

export default xmlAnalizer;

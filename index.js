import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import xmlAnalizer from "./xml-analizer.js";
import createExcel from "./excel-creator.js";

// Crear una interfaz readline para leer desde la consola
const rl = readline.createInterface({ input, output });

// Preguntar al usuario el autor para la liquidación de regalías
const author = await rl.question(
  "¿A qué autor quieres hacer la liquidación de regalías? "
);
// Validar que se ingresó un autor
if (!author) {
  console.log("No se ingresó ningún autor. Terminando programa.");
  process.exit(0);
}
// Preguntar al usuario los ISBN de los libros para liquidar regalías
const bookListString = await rl.question(
  "Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,). "
);
const bookList = await bookListString.split(",").map((book) => book.trim());

// Validar que se ingresó al menos un código
if (!bookListString) {
  console.log("No se ingresó ningún libro. Terminando programa.");
  process.exit(0);
}

// Obtener el porcentaje de regalías para cada libro
const percentages = {};
for (const book of bookList) {
  const percentage = await rl.question(
    `Ingrese el porcentaje de regalías para el libro ${book}. Por favor escribe solo el número sin el signo %: `
  );
  // Validar que se ingresó un porcentaje
  if (!percentage) {
    console.log("No se ingresó ningún porcentaje. Terminando programa.");
    process.exit(0);
  }
  // Validar que el porcentaje ingresado está en un rango adecuado (entre 0 y 100)
  if (Number(percentage) < 0 || Number(percentage) > 100) {
    console.log("El porcentaje ingresado no es adecuado. Terminando programa.");
    process.exit(0);
  }
  const decimalPercentage = percentage;
  percentages[book] = decimalPercentage;
}

rl.close();

// Analizar los archivos XML
const path = "./xml-billing";

const bookListData = await xmlAnalizer(path, bookList, percentages);

// Imprimir información sobre el autor, los libros y las ventas
console.log(`Autor: ${author}`);
console.log("Libros:");
for (const book in percentages) {
  console.log(`- ${book}: ${percentages[book]}%`);
}
console.log("Ventas:");
console.log(bookListData);

// Crear una interfaz readline para leer desde la consola
const excel = readline.createInterface({ input, output });

// Preguntar al usuario si desea generar un archivo de Excel con la información
const generateExcel = await excel.question(
  "¿Quieres generar un archivo de Excel con esta información? (y/n)"
);

excel.close();

// Verificar si el usuario desea generar el archivo de Excel
if (
  generateExcel === "y" ||
  generateExcel === "yes" ||
  generateExcel === "si" ||
  generateExcel === "sí"
) {
  createExcel(bookListData, author);
  console.log("Se generó el archivo");
} else {
  console.log("No se generará el archivo");
}

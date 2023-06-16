import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const author = await rl.question(
  "¿A qué autor quieres hacer la liquidación de regalías? "
);
const bookListString = await rl.question(
  "Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,). "
);
const bookList = bookListString.split(",").map((book) => book.trim());

const percentages = {};

for (const book of bookList) {
  const percentage = await rl.question(`Ingrese el porcentaje de regalías para el libro ${book}. Por favor escribe solo el número sin el signo %: `);
  percentages[book] = percentage;
};
console.log(`Autor: ${author}, ${typeof author}`);
console.log('Libros:')
for (const book in percentages) {
  console.log(`- ${book}: ${percentages[book]}%`);
}

rl.close();

import ExcelJS from "exceljs";

const createExcel = async (sales, author) => {
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
      header: "Fecha",
      key: "date",
      width: 10,
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
export default createExcel;

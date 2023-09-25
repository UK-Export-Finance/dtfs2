const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');

// This function processes the file from the request of an upload. If it is an xlsx file it converts the data to an array of csv data
// It will then use the csv parser library to convert this csv data to an array of JSON objects representing the data
// The function returns both the JSON representing the csv data and a file buffer of the csv data to be used to save and persist the data
// It can also do the same for .csv data where the first step of converting .xlsx to .csv can be skipped
const convertToCsv = async (file) => {
  let csvJson;
  let fileBuffer;

  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    // Read the .xlsx file using exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer, { sheetStubs: true }).then(async () => {
      const worksheet = workbook.worksheets[0]; // Assume the utilisation report data is on the first sheet
      const csvData = [];
      const csvDataWithCellAddresses = [];

      // We create one csv version of the data without cell addresses to be persisted in azure
      // And another csv version of the data with cell addresses to be used for validation so we can
      // tell the user which cells have errors
      let firstRow = true;
      worksheet.eachRow((row) => {
        const rowData = [];
        const rowDataWithCellAddresses = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          rowData.push(cell.value);
          if (firstRow) {
            rowDataWithCellAddresses.push(`${cell.value}`);
          } else {
            rowDataWithCellAddresses.push(`${cell.value}-${cell.address}`);
          }
        });
        firstRow = false;
        csvData.push(rowData.join(','));
        csvDataWithCellAddresses.push(rowDataWithCellAddresses.join(','));
      });

      // We create a stream so we can pipe it through the csv parser library
      const stream = new Readable({
        read() {
          for (const line of csvDataWithCellAddresses) {
            this.push(`${line}\n`); // Add newline to simulate line-by-line reading
          }
          this.push(null); // End the stream
        },
      });
      const parsedCsvData = [];
      const readStreamPromise = new Promise((resolve, reject) => {
        try {
          stream
            .pipe(
              csv({
                mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, ' ').trim(),
                mapValues: ({ value }) => {
                  const lastDashIndex = value.lastIndexOf('-');
                  const cellValue = value.substring(0, lastDashIndex);
                  const cellAddress = value.substring(lastDashIndex + 1);

                  // Split the cell address into column and row
                  const [column, row] = cellAddress.match(/([A-Z]+)(\d+)/).slice(1);
                  return { value: cellValue !== 'null' ? cellValue : null, column, row };
                },
              }),
            )
            .on('data', (row) => {
              parsedCsvData.push(row);
            })
            .on('end', () => {
              resolve(parsedCsvData);
            });
        } catch (error) {
          console.error(error);
          reject(new Error('Error parsing CSV data'));
        }
      });
      fileBuffer = Buffer.from(csvData);
      csvJson = await readStreamPromise;
    });
  } else if (file.mimetype === 'text/csv') {
    const stream = Readable.from(file.buffer);
    const readStreamPromise = new Promise((resolve, reject) => {
      try {
        const csvData = [];
        stream
          .pipe(
            csv({
              mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, ' ').trim(),
              mapValues: ({ index, value }) => ({ value, column: index + 1, row: null }),
            }),
          )
          .on('data', (row) => {
            csvData.push(row);
          })
          .on('end', () => {
            resolve(csvData);
          });
      } catch (error) {
        console.error(error);
        reject(new Error('Error parsing CSV data'));
      }
    });
    fileBuffer = file.buffer;
    csvJson = await readStreamPromise;
  }
  return { csvJson, fileBuffer };
};

module.exports = {
  convertToCsv,
};

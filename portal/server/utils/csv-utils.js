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
    await workbook.xlsx.load(file.buffer).then(async () => {
      const worksheet = workbook.getWorksheet(1); // Assume the utilisation report data is on sheet 1
      const csvData = [];

      // Iterate through rows and columns and extract data
      worksheet.eachRow((row) => {
        const rowData = [];
        row.eachCell((cell) => {
          rowData.push(cell.value);
        });
        csvData.push(rowData.join(','));
      });

      const stream = new Readable({
        read() {
          for (const line of csvData) {
            this.push(line + '\n'); // Add newline to simulate line-by-line reading
          }
          this.push(null); // End the stream
        },
      });
      const parsedCsvData = [];
      const readStreamPromise = new Promise((resolve, reject) => {
        try {
          stream
            .pipe(
              csv(
                csv({
                  mapValues: ({ header }) => header.toLowerCase(),
                }),
              ),
            )
            .on('data', (row) => {
              parsedCsvData.push(row);
            })
            .on('end', () => {
              resolve(parsedCsvData);
            });
        } catch (error) {
          console.log(error);
          reject();
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
            csv(
              csv({
                mapValues: ({ header }) => header.toLowerCase(),
              }),
            ),
          )
          .on('data', (row) => {
            csvData.push(row);
          })
          .on('end', () => {
            resolve(csvData);
          });
      } catch (error) {
        console.log(error);
        reject();
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

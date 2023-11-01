const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { CELL_ADDRESS_REGEX } = require('../constants/regex');

const columnIndexToExcelColumn = (index) => {
  let result = '';
  let indexTracker = index;
  while (indexTracker >= 0) {
    result = String.fromCharCode((indexTracker % 26) + 65) + result;
    indexTracker = Math.floor(indexTracker / 26) - 1;
  }
  return result;
};

const parseXlsxToCsvArrays = (worksheet) => {
  const csvData = [];
  const csvDataWithCellAddresses = [];

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
  return { csvData, csvDataWithCellAddresses };
};

const xlsxBasedCsvToJsonPromise = async (csvDataWithCellAddresses) => {
  const csvStream = new Readable({
    read() {
      for (const line of csvDataWithCellAddresses) {
        this.push(`${line}\n`); // Add newline to simulate line-by-line reading of the csv file
      }
      this.push(null); // End the stream
    },
  });
  return new Promise((resolve, reject) => {
    try {
      const jsonParsedData = [];
      csvStream
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, ' ').trim(),
            mapValues: ({ value }) => {
              const lastDashIndex = value.lastIndexOf('-');
              const cellValue = value.substring(0, lastDashIndex);
              const cellAddress = value.substring(lastDashIndex + 1);

              // Split the cell address into column and row
              const cellAddressMatch = cellAddress.match(CELL_ADDRESS_REGEX);
              if (!cellAddressMatch) {
                return { value: cellValue !== 'null' ? cellValue : null, column: null, row: null };
              }
              const [column, row] = cellAddressMatch.slice(1);
              if (!column || !row) {
                throw new Error('Error parsing CSV data');
              }
              return { value: cellValue !== 'null' ? cellValue : null, column, row };
            },
          }),
        )
        .on('data', (row) => {
          jsonParsedData.push(row);
        })
        .on('end', () => {
          resolve(jsonParsedData);
        });
    } catch (error) {
      console.error(error);
      reject(new Error('Error parsing CSV data'));
    }
  });
};

const csvBasedCsvToJsonPromise = async (csvBuffer) => {
  const csvStream = Readable.from(csvBuffer);
  return new Promise((resolve, reject) => {
    try {
      const csvData = [];
      csvStream
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, ' ').trim(),
            mapValues: ({ index, value }) => ({ value, column: columnIndexToExcelColumn(index), row: null }),
          }),
        )
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', () => {
          // loop through to add row to all objects now
          const csvDataWithRow = csvData.map((row, index) => {
            const keys = Object.keys(row);
            const rowData = row;
            for (const key of keys) {
              rowData[key].row = index + 1;
            }
            return rowData;
          });
          resolve(csvDataWithRow);
        });
    } catch (error) {
      console.error(error);
      reject(new Error('Error parsing CSV data'));
    }
  });
};

// This function processes the file from the request of an upload. If it is an xlsx file it converts the data to an array of csv data
// It will then use the csv parser library to convert this csv data to an array of JSON objects representing the data
// The function returns both the JSON representing the csv data and a file buffer of the csv data to be used to save and persist the data
// It can also do the same for .csv data where the first step of converting .xlsx to .csv can be skipped
const extractCsvData = async (file) => {
  let csvJson;
  let fileBuffer;

  try {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Read the .xlsx file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer, { sheetStubs: true }).then(async () => {
        const worksheet = workbook.worksheets[0]; // Assume the utilisation report data is on the first sheet

        // We create one csv version of the data without cell addresses to be persisted in azure
        // And another csv version of the data with cell addresses to be used for validation so we can
        // tell the user which cells have errors
        const { csvData, csvDataWithCellAddresses } = parseXlsxToCsvArrays(worksheet);

        fileBuffer = Buffer.from(csvData, 'utf-8');
        csvJson = await xlsxBasedCsvToJsonPromise(csvDataWithCellAddresses);
      });
    } else if (file.mimetype === 'text/csv') {
      fileBuffer = file.buffer;
      csvJson = await csvBasedCsvToJsonPromise(file.buffer);
    } else {
      return new Error('Invalid file type');
    }

    return { csvJson, fileBuffer, error: false };
  } catch (error) {
    console.error('Error extracting data from csv/xlsx file: %O', error);
    return { csvJson: null, fileBuffer: null, error: true };
  }
};

const removeCellAddressesFromArray = (csvJsonArray) =>
  csvJsonArray.map((rowDataWithCellAddresses) => {
    const rowDataWithoutCellAddresses = {};
    const keys = Object.keys(rowDataWithCellAddresses);
    keys.forEach((key) => {
      rowDataWithoutCellAddresses[key] = rowDataWithCellAddresses[key].value;
    });
    return rowDataWithoutCellAddresses;
  });

module.exports = {
  extractCsvData,
  columnIndexToExcelColumn,
  xlsxBasedCsvToJsonPromise,
  csvBasedCsvToJsonPromise,
  removeCellAddressesFromArray,
};

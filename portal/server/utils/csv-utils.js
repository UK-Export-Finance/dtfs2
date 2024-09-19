const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { CELL_ADDRESS_REGEX } = require('../constants/regex');

/**
 * @typedef {import('exceljs').Worksheet} Worksheet
 * @typedef {Object} ParsedXlsxDataResponse
 * @property {Object} csvData - array representing csv data from the worksheet
 * @property {Object} csvDataWithCellAddresses - array representing csv data from the worksheet with cell addresses included
 */

/**
 * Converts a column index into an excel column (e.g. 0 -> A, 1 -> B)
 * @param {number} index - number representing a column index e.g. 1.
 * @returns {string} - string representing the excel column.
 */
const columnIndexToExcelColumn = (index) => {
  let result = '';
  let indexTracker = index;
  while (indexTracker >= 0) {
    result = String.fromCharCode((indexTracker % 26) + 65) + result;
    indexTracker = Math.floor(indexTracker / 26) - 1;
  }
  return result;
};

/**
 * Converts the excel column into a column index (e.g. A -> 0, B -> 1)
 * @param {string} column - string representing an excel column e.g. 'E'.
 * @returns {number} - column index.
 */
const excelColumnToColumnIndex = (column) => {
  let result = 0;
  for (let i = 0; i < column.length; i += 1) {
    // 26 represents the number of letters in the alphabet
    result *= 26;
    // the unicode value of A is 65 so we minus 64 to get the index of A as 1
    result += column.charCodeAt(i) - 64;
  }
  return result - 1;
};

/**
 * Checks for floating-point rounding errors and rounds to two decimal places if within error tolerance.
 * @param {number} number - The number to check and potentially round.
 * @returns {number} - The rounded number to two decimal places if within tolerance, otherwise the original number.
 * @throws {TypeError} - If the input is not a number.
 */
const handleFloatingPointRoundingErrors = (number) => {
  if (typeof number !== 'number') {
    throw new TypeError('Input must be a number');
  }

  const TOLERANCE = 1e-6;
  const DECIMAL_PLACES = 2;

  const roundedNumber = Number(number.toFixed(DECIMAL_PLACES));

  const isRoundedNumberWithinErrorTolerance = Math.abs(number - roundedNumber) < TOLERANCE;

  return isRoundedNumberWithinErrorTolerance ? roundedNumber : number;
};


/**
 * Extracts the value in the cell of an excel cell and removes any new lines or commas so that it doesn't affect parsing as a csv.
 * @param {Object} cell - excel cell.
 * @returns {string | number} - cell value.
 */
const extractCellValue = (cell) => {
  /* eslint-disable-next-line no-underscore-dangle */
  const cellValue = cell.value?.result ?? cell._value?.result ?? cell.value;

  if (typeof cellValue === 'number') {
    return handleFloatingPointRoundingErrors(cellValue);
  }

  const cellValueWithoutNewLines =
    typeof cellValue === 'string'
      ? cellValue
          .replace(/\r\n|\r|\n/g, ' ')
          .replace(/,/g, '')
          .trim()
      : cellValue;
  return cellValueWithoutNewLines;
};

/**
 * Takes in the worksheet from the exceljs package and parses it to an array of csv data.
 * @param {Worksheet} worksheet - worksheet representing the data.
 * @returns {ParsedXlsxDataResponse} - object with a csvData array and csvData array of objects which also contain the cell address.
 */
const parseXlsxToCsvArrays = (worksheet) => {
  const csvData = [];
  const csvDataWithCellAddresses = [];

  let firstRow = true;
  let headerCount = 0;
  let columnCount = 0;
  let lastAddress = null;
  worksheet.eachRow((row) => {
    const rowData = [];
    const rowDataWithCellAddresses = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = extractCellValue(cell);
      rowData.push(cellValue);
      if (firstRow) {
        rowDataWithCellAddresses.push(`${cellValue}`);
        headerCount += 1;
      } else {
        rowDataWithCellAddresses.push(`${cellValue}-${cell.address}`);
        lastAddress = cell.address;
        columnCount += 1;
      }
    });

    if (!firstRow) {
      // If the row has no data in the final columns of the row, we need to fill in the empty cells with
      // empty strings and cell addresses so that the csv parser library can parse the data correctly
      while (columnCount < headerCount) {
        rowData.push('');
        // calculate the cell address here given the last address
        const lastAddressMatch = lastAddress.match(CELL_ADDRESS_REGEX);
        const [lastColumn, lastRow] = lastAddressMatch.slice(1);
        const lastColumnIndex = excelColumnToColumnIndex(lastColumn);
        const newColumn = columnIndexToExcelColumn(lastColumnIndex + 1);
        rowDataWithCellAddresses.push(`-${newColumn}${lastRow}`);
        columnCount += 1;
      }
    }

    firstRow = false;
    columnCount = 0;
    csvData.push(rowData.join(','));
    csvDataWithCellAddresses.push(rowDataWithCellAddresses.join(','));
  });
  return { csvData: csvData.join('\n'), csvDataWithCellAddresses };
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
      const nonPrintableAsciiCharacterRegex = /[^ -~]+/g;
      csvStream
        .pipe(
          csv({
            mapHeaders: ({ header }) =>
              header
                .toLowerCase()
                .replace(/\s/g, ' ')
                .replace(nonPrintableAsciiCharacterRegex, ' ')
                .trim(),
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
              // Add 2 to the index because the first row is the header and the index is 0 based
              rowData[key].row = index + 2;
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
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
      // Read the .xlsx file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer, { sheetStubs: true }).then(async () => {
        const worksheet = workbook.worksheets[0]; // Assume the utilisation report data is on the first sheet

        // We create one csv version of the data without cell addresses to be persisted in azure
        // And another csv version of the data with cell addresses to be used for validation so we can
        // tell the user which cells have errors
        const { csvData, csvDataWithCellAddresses } = parseXlsxToCsvArrays(worksheet);

        fileBuffer = Buffer.from(csvData, 'latin1');
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
  excelColumnToColumnIndex,
  parseXlsxToCsvArrays,
  xlsxBasedCsvToJsonPromise,
  csvBasedCsvToJsonPromise,
  removeCellAddressesFromArray,
  extractCellValue,
  handleFloatingPointRoundingErrors,
};

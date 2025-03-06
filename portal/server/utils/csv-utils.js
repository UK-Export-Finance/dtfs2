const { FLOATING_POINT_ROUNDING_DECIMAL_PLACES } = require('@ukef/dtfs2-common');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { CELL_ADDRESS_REGEX } = require('../constants/regex');

/**
 * @typedef {import('exceljs').Worksheet} Worksheet
 *
 * @typedef {string | number | boolean | Date | object | null} CellValue
 *
 * @typedef {Object} ParsedXlsxDataResponse
 * @property {Object} csvData - array representing csv data from the worksheet
 * @property {Object} csvDataWithCellAddresses - array representing csv data from the worksheet with cell addresses included
 *
 * @typedef {Object} ExtractCsvDataResponse
 * @property {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[] | null} csvJson - The JSON representing the csv data
 * @property {Buffer | null} fileBuffer - The file buffer of the csv data
 * @property {boolean} error - An error flag
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
 * Handles floating point rounding errors by rounding a number to
 * {@link FLOATING_POINT_ROUNDING_DECIMAL_PLACES} decimal places.
 * @param {number} number - The number to round.
 * @returns {number} - The rounded number.
 * @throws {TypeError} - If the input is not a number.
 */
const handleFloatingPointRoundingErrors = (number) => {
  if (typeof number !== 'number') {
    throw new TypeError('Input must be a number');
  }

  return Number(number.toFixed(FLOATING_POINT_ROUNDING_DECIMAL_PLACES));
};

/**
 * Checks if the cell value is a rich text value.
 * returns true if so as needs further processing to convert to a string.
 * @param {CellValue} cellValue
 * @returns {boolean} - true if the cell value is a rich text value.
 */
const isRichTextValue = (cellValue) => Boolean(cellValue && Array.isArray(cellValue.richText));

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

  // sets the value to the cellValue - replaced if it is a richText value
  let value = cellValue;

  /**
   * if cellValue is a richText value
   * then needs to be converted to a string
   * by joining the text values of the richText array
   */
  if (isRichTextValue(cellValue)) {
    value = cellValue.richText
      .filter(({ text }) => text)
      .map(({ text }) => text)
      .join(' ');
  }

  const cellValueWithoutNewLines =
    typeof value === 'string'
      ? value
          .replace(/\r\n|\r|\n/g, ' ')
          .replace(/,/g, '')
          .trim()
      : value;
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

/**
 * Extracts csv data with cell addresses from xlsx based csv file
 * @param {string[]} csvDataWithCellAddresses - Array of comma separated lines of csv file, with values followed by cell location
 * @returns {Record<string, { value: string | null; column: string; row: string }>} The data from the file with
 * - The header of the column as the key
 * - The contents of the cell as value
 * - The location data of the cell within the spreadsheet (column is using alphabet, rows are numbers as strings)
 */
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
            mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, ' ').replace(nonPrintableAsciiCharacterRegex, ' ').trim(),
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

/**
 * This function processes the file from the request of an upload. If it is an xlsx file it converts the data to an array of csv data.
 * It will then use the csv parser library to convert this csv data to an array of JSON objects representing the data.
 * The function returns both the JSON representing the csv data and a file buffer of the csv data to be used to save and persist the data.
 * It can also do the same for .csv data where the first step of converting .xlsx to .csv can be skipped.
 *
 * @param {Express.Multer.File} file - The file
 * @returns {Promise<ExtractCsvDataResponse>} - The JSON representing the csv data, the file buffer of the csv data and an error flag.
 */
const extractCsvData = async (file) => {
  let csvJson;
  let fileBuffer;

  try {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
      // Read the .xlsx file using exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer, { sheetStubs: true }).then(async () => {
        // An Excel file must contain at least 1 visible worksheet at all times.
        // Assume the utilisation report data is on the first visible sheet.
        const worksheet = workbook.worksheets.find((sheet) => sheet.state === 'visible');
        if (!worksheet) {
          throw new Error('No visible worksheet found in the Excel file');
        }

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
    console.error('Error extracting data from csv/xlsx file %o', error);
    return { csvJson: null, fileBuffer: null, error: true };
  }
};

/**
 * Removes cell addresses from the array of JSON objects representing the csv data.
 * @param {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[]} csvJsonArray - Array of JSON objects representing the csv data.
 * @returns {Record<string, string | null>[]} - Array of JSON objects representing the csv data without cell addresses.
 */
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
  isRichTextValue,
  xlsxBasedCsvToJsonPromise,
  csvBasedCsvToJsonPromise,
  removeCellAddressesFromArray,
  extractCellValue,
  handleFloatingPointRoundingErrors,
};

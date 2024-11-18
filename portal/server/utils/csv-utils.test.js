const ExcelJS = require('exceljs');
const { CURRENCY } = require('@ukef/dtfs2-common');
const {
  columnIndexToExcelColumn,
  excelColumnToColumnIndex,
  xlsxBasedCsvToJsonPromise,
  csvBasedCsvToJsonPromise,
  removeCellAddressesFromArray,
  extractCellValue,
  parseXlsxToCsvArrays,
  handleFloatingPointRoundingErrors,
} = require('./csv-utils');

describe('csv-utils', () => {
  describe('columnIndexToExcelColumn', () => {
    it('returns the correct column for an index below 26', async () => {
      const excelColumnIndex = columnIndexToExcelColumn(2);

      expect(excelColumnIndex).toEqual('C');
    });

    it('returns the correct column for an index above 26', async () => {
      const excelColumnIndex = columnIndexToExcelColumn(30);

      expect(excelColumnIndex).toEqual('AE');
    });
  });

  describe('excelColumnToColumnIndex', () => {
    it('returns the correct index for a column below 26', async () => {
      const columnIndex = excelColumnToColumnIndex('C');

      expect(columnIndex).toEqual(2);
    });

    it('returns the correct index for a column above 26', async () => {
      const columnIndex = excelColumnToColumnIndex('AE');

      expect(columnIndex).toEqual(30);
    });
  });

  describe('parseXlsxToCsvArrays', () => {
    it('Parses an excelJS workbook', async () => {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.columns = [
        { header: 'UKEF facility ID', key: 'A' },
        { header: 'Exporter', key: 'B' },
        { header: 'Base currency', key: 'C' },
      ];
      worksheet.addRow({ A: '20001371', B: 'Exporter 1', C: CURRENCY.GBP });
      worksheet.addRow({ A: '20004872', B: 'Exporter 2', C: 'EUR' });

      const parsedData = parseXlsxToCsvArrays(worksheet);

      const expectedParsedData = {
        csvData: 'UKEF facility ID,Exporter,Base currency\n20001371,Exporter 1,GBP\n20004872,Exporter 2,EUR',
        csvDataWithCellAddresses: ['UKEF facility ID,Exporter,Base currency', '20001371-A2,Exporter 1-B2,GBP-C2', '20004872-A3,Exporter 2-B3,EUR-C3'],
      };

      expect(parsedData).toEqual(expectedParsedData);
    });

    it('Parses an excelJS workbook and adds in addresses for any missing cells in a row', async () => {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.columns = [
        { header: 'UKEF facility ID', key: 'A' },
        { header: 'Exporter', key: 'B' },
        { header: 'Base currency', key: 'C' },
      ];
      worksheet.addRow({ A: '20001371', B: 'Exporter 1', C: CURRENCY.GBP });
      worksheet.addRow({ A: '20004872', B: 'Exporter 2' });

      const parsedData = parseXlsxToCsvArrays(worksheet);

      const expectedParsedData = {
        csvData: 'UKEF facility ID,Exporter,Base currency\n20001371,Exporter 1,GBP\n20004872,Exporter 2,',
        csvDataWithCellAddresses: ['UKEF facility ID,Exporter,Base currency', '20001371-A2,Exporter 1-B2,GBP-C2', '20004872-A3,Exporter 2-B3,-C3'],
      };

      expect(parsedData).toEqual(expectedParsedData);
    });

    it('Parses an excelJS workbook and handles any floating point rounding errors in numeric cells', async () => {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet('Sheet1');
      worksheet.columns = [
        { header: 'UKEF facility ID', key: 'A' },
        { header: 'Exporter', key: 'B' },
        { header: 'Base currency', key: 'C' },
        { header: 'Facility utilisation', key: 'D' },
      ];
      worksheet.addRow({ A: '20001371', B: 'Exporter 1', C: CURRENCY.GBP, D: 3938753.8000000007 });
      worksheet.addRow({ A: '20004872', B: 'Exporter 2', C: 'EUR', D: 761579.3699999999 });
      worksheet.addRow({ A: '20004873', B: 'Exporter 3', C: 'USD', D: 123.456789 });
      worksheet.addRow({ A: '20004874', B: 'Exporter 4', C: CURRENCY.GBP, D: 987654321.1200006 });

      const parsedData = parseXlsxToCsvArrays(worksheet);

      const expectedParsedData = {
        csvData:
          'UKEF facility ID,Exporter,Base currency,Facility utilisation\n20001371,Exporter 1,GBP,3938753.8\n20004872,Exporter 2,EUR,761579.37\n20004873,Exporter 3,USD,123.456789\n20004874,Exporter 4,GBP,987654321.120001',
        csvDataWithCellAddresses: [
          'UKEF facility ID,Exporter,Base currency,Facility utilisation',
          '20001371-A2,Exporter 1-B2,GBP-C2,3938753.8-D2',
          '20004872-A3,Exporter 2-B3,EUR-C3,761579.37-D3',
          '20004873-A4,Exporter 3-B4,USD-C4,123.456789-D4',
          '20004874-A5,Exporter 4-B5,GBP-C5,987654321.120001-D5',
        ],
      };

      expect(parsedData).toEqual(expectedParsedData);
    });
  });

  describe('xlsxBasedCsvToJsonPromise', () => {
    it('correctly parses the csv array to a json array of data', async () => {
      const csvData = [
        ['UKEF facility ID', 'Exporter', 'Base currency'],
        ['20001371-A2', 'Exporter 1-B2', 'GBP-C2'],
        ['20004872-A3', 'Exporter 2-B3', 'EUR-C3'],
      ];

      const csvJsonData = await xlsxBasedCsvToJsonPromise(csvData);

      const expectedJsonData = [
        {
          'base currency': { column: 'C', row: '2', value: CURRENCY.GBP },
          exporter: { column: 'B', row: '2', value: 'Exporter 1' },
          'ukef facility id': { column: 'A', row: '2', value: '20001371' },
        },
        {
          'base currency': { column: 'C', row: '3', value: 'EUR' },
          exporter: { column: 'B', row: '3', value: 'Exporter 2' },
          'ukef facility id': { column: 'A', row: '3', value: '20004872' },
        },
      ];

      expect(csvJsonData).toEqual(expectedJsonData);
    });
  });

  describe('csvBasedCsvToJsonPromise', () => {
    it('correctly parses the csv array to a json array of data', async () => {
      const csvData = [
        ['UKEF facility ID', 'Exporter', 'Base currency'],
        ['20001371', 'Exporter 1', CURRENCY.GBP],
        ['20004872', 'Exporter 2', 'EUR'],
      ];
      const buffer = Buffer.from(csvData.join('\n'));

      const csvJsonData = await csvBasedCsvToJsonPromise(buffer);

      const expectedJsonData = [
        {
          'base currency': { column: 'C', row: 2, value: CURRENCY.GBP },
          exporter: { column: 'B', row: 2, value: 'Exporter 1' },
          'ukef facility id': { column: 'A', row: 2, value: '20001371' },
        },
        {
          'base currency': { column: 'C', row: 3, value: 'EUR' },
          exporter: { column: 'B', row: 3, value: 'Exporter 2' },
          'ukef facility id': { column: 'A', row: 3, value: '20004872' },
        },
      ];

      expect(csvJsonData).toEqual(expectedJsonData);
    });
  });

  describe('removeCellAddressesFromArray', () => {
    it('removes the cell addresses from csv json data', async () => {
      const csvJsonData = [
        {
          'base currency': { column: 'C', row: '2', value: CURRENCY.GBP },
          exporter: { column: 'B', row: '2', value: 'Exporter 1' },
          'ukef facility id': { column: 'A', row: '2', value: '20001371' },
        },
        {
          'base currency': { column: 'C', row: '3', value: 'EUR' },
          exporter: { column: 'B', row: '3', value: 'Exporter 2' },
          'ukef facility id': { column: 'A', row: '3', value: '20004872' },
        },
      ];

      const mappedData = removeCellAddressesFromArray(csvJsonData);

      const expectedJsonData = [
        {
          'base currency': CURRENCY.GBP,
          exporter: 'Exporter 1',
          'ukef facility id': '20001371',
        },
        {
          'base currency': 'EUR',
          exporter: 'Exporter 2',
          'ukef facility id': '20004872',
        },
      ];

      expect(mappedData).toEqual(expectedJsonData);
    });
  });

  describe('extractCellValue', () => {
    it('returns the cell value', async () => {
      const cellValue = { value: CURRENCY.GBP };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(CURRENCY.GBP);
    });

    it('returns the cell value without new lines', async () => {
      const cellValue = { value: 'GBP\na' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual('GBP a');
    });

    it('returns the cell value without any new line characters', async () => {
      const cellValue = { value: 'GBP\ra' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual('GBP a');
    });

    it('returns the cell value without new lines without whitespace at start or end', async () => {
      const cellValue = { value: '\r\nGBP\na' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual('GBP a');
    });

    it('returns the cell value without commas', async () => {
      const cellValue = { value: 'GBP,' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(CURRENCY.GBP);
    });

    it('returns the cell value without commas or new lines', async () => {
      const cellValue = { value: '\n100,000' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual('100000');
    });

    it('returns the cell value if the value is a number', async () => {
      const cellValue = { value: 123 };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(123);
    });

    it('returns the cell value if the cell is using a formula to calculate the value', async () => {
      const cellValue = { value: { result: 123, formula: 'SUM(A1:A2)' } };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(123);
    });

    it('returns the cell value if the cell is using a formula to calculate the value and the result is missing in the value key', async () => {
      const cellValue = { _value: { result: 123, formula: 'SUM(A1:A2)' } };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(123);
    });

    it.each([
      { cellValue: { value: 761579.3699999999 }, expected: 761579.37 },
      { cellValue: { value: 3938753.8000000007 }, expected: 3938753.8 },
      { cellValue: { value: 987654321.1200005 }, expected: 987654321.12 },
      { cellValue: { value: 987654321.1200006 }, expected: 987654321.120001 },
    ])('returns $expected for numeric input $cellValue.value and handles potential floating-point issues', async ({ cellValue, expected }) => {
      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual(expected);
    });
  });

  describe('handleFloatingPointRoundingErrors', () => {
    it.each([
      { input: 761579.3699999999, expected: 761579.37 },
      { input: 3938753.8000000007, expected: 3938753.8 },
      { input: 9999.9999999999, expected: 10000 },
      { input: 987654321.1200005, expected: 987654321.12 },
      { input: 987654321.1200006, expected: 987654321.120001 },
    ])('should return $expected for $input', ({ input, expected }) => {
      expect(handleFloatingPointRoundingErrors(input)).toEqual(expected);
    });

    it.each([123.456, 0.1, 1.230001])('should return %f unchanged (already rounded to required decimal places)', (value) => {
      expect(handleFloatingPointRoundingErrors(value)).toEqual(value);
    });

    it.each([456, 1234567, Number.MAX_SAFE_INTEGER])('should return integer %d unchanged', (value) => {
      expect(handleFloatingPointRoundingErrors(value)).toEqual(value);
    });

    it.each([
      { input: -761579.3699999999, expected: -761579.37 },
      { input: -3938753.8000000007, expected: -3938753.8 },
      { input: -123.456, expected: -123.456 },
      { input: -987654321.1200006, expected: -987654321.120001 },
      { input: Number.MIN_SAFE_INTEGER, expected: Number.MIN_SAFE_INTEGER },
    ])('should return $expected for negative number $input', ({ input, expected }) => {
      expect(handleFloatingPointRoundingErrors(input)).toEqual(expected);
    });

    it.each(['123.456', null, undefined])('should throw TypeError for non-number input %o', (input) => {
      expect(() => handleFloatingPointRoundingErrors(input)).toThrow(TypeError);
    });
  });
});

const {
  columnIndexToExcelColumn,
  xlsxBasedCsvToJsonPromise,
  csvBasedCsvToJsonPromise,
  removeCellAddressesFromArray,
  extractCellValue,
} = require('./csv-utils');

describe('csv-utils', () => {
  describe('columnIndexToExcelColumn', () => {
    it('returns the correct column for an index below 26', async () => {
      const excelColumnIndex = columnIndexToExcelColumn(2);

      expect(excelColumnIndex).toBe('C');
    });

    it('returns the correct column for an index above 26', async () => {
      const excelColumnIndex = columnIndexToExcelColumn(30);

      expect(excelColumnIndex).toBe('AE');
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
          'base currency': { column: 'C', row: '2', value: 'GBP' },
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
        ['20001371', 'Exporter 1', 'GBP'],
        ['20004872', 'Exporter 2', 'EUR'],
      ];
      const buffer = Buffer.from(csvData.join('\n'));

      const csvJsonData = await csvBasedCsvToJsonPromise(buffer);

      const expectedJsonData = [
        {
          'base currency': { column: 'C', row: 1, value: 'GBP' },
          exporter: { column: 'B', row: 1, value: 'Exporter 1' },
          'ukef facility id': { column: 'A', row: 1, value: '20001371' },
        },
        {
          'base currency': { column: 'C', row: 2, value: 'EUR' },
          exporter: { column: 'B', row: 2, value: 'Exporter 2' },
          'ukef facility id': { column: 'A', row: 2, value: '20004872' },
        },
      ];

      expect(csvJsonData).toEqual(expectedJsonData);
    });
  });

  describe('removeCellAddressesFromArray', () => {
    it('removes the cell addresses from csv json data', async () => {
      const csvJsonData = [
        {
          'base currency': { column: 'C', row: '2', value: 'GBP' },
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
          'base currency': 'GBP',
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
      const cellValue = { value: 'GBP' };

      const extractedValue = extractCellValue(cellValue);

      expect(extractedValue).toEqual('GBP');
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
  });
});

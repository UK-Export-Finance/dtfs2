const { columnIndexToExcelColumn, xlsxBasedCsvToJsonPromise, csvBasedCsvToJsonPromise } = require('./csv-utils');

describe('csv-utils', () => {
  describe('columnIndexToExcelColumn', () => {
    it('returns the correct column for an index below 26', async () => {
      const excelColumnIndex = columnIndexToExcelColumn(2);

      expect(excelColumnIndex).toBe('C');
    });

    it('returns the correct column for an index below 26', async () => {
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
          'base currency': { column: 'C', row: null, value: 'GBP' },
          exporter: { column: 'B', row: null, value: 'Exporter 1' },
          'ukef facility id': { column: 'A', row: null, value: '20001371' },
        },
        {
          'base currency': { column: 'C', row: null, value: 'EUR' },
          exporter: { column: 'B', row: null, value: 'Exporter 2' },
          'ukef facility id': { column: 'A', row: null, value: '20004872' },
        },
      ];

      expect(csvJsonData).toEqual(expectedJsonData);
    });
  });
});

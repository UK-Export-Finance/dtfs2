import { validateUtilisationReportCsvData } from '.';
import { validateHeaders } from './utilisation-report-cell-validators/validate-csv-data/headers';
import { validateCells } from './utilisation-report-cell-validators/validate-csv-data/cells';
import { validateRows } from './utilisation-report-cell-validators/validate-csv-data/rows';

jest.mock('./utilisation-report-cell-validators', () => ({
  generateUkefFacilityIdError: jest.fn(),
  generateBaseCurrencyError: jest.fn(),
  generateFacilityUtilisationError: jest.fn(),
  generatePaymentCurrencyError: jest.fn(),
  generatePaymentExchangeRateError: jest.fn(),
  generateTotalFeesAccruedCurrencyError: jest.fn(),
  generateTotalFeesAccruedExchangeRateError: jest.fn(),
}));

describe('services/utilisation-report-data-validator', () => {
  const csvData = [
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBB', column: 'D', row: 1 },
      'facility utilisation': { value: '2000', column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBP', column: 'D', row: 1 },
      'facility utilisation': { value: '2000a', column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001372', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBP', column: 'D', row: 1 },
      'facility utilisation': { value: '3000', column: 'F', row: 1 },
    },
  ];

  it('should return the expected validation errors when calling validateUtilisationReportCsvData', async () => {
    const response = await validateUtilisationReportCsvData(csvData);

    const { missingHeaderErrors, availableHeaders } = validateHeaders(csvData[0]);

    const cellValidationErrors = await validateCells(csvData, availableHeaders);

    const rowValidationErrors = validateRows(csvData);

    const expectedValidationErrors = [...missingHeaderErrors, ...cellValidationErrors, ...rowValidationErrors];

    expect(response).toEqual(expectedValidationErrors);
  });
});

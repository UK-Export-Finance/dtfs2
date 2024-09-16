import { validateUtilisationReportCsvData } from '.';
import validateUtilisationReportCsvHeaders from './utilisation-report-cell-validators/helpers/validate-csv-headers';
import validateUtilisationReportCsvCellData from './utilisation-report-cell-validators/helpers/validate-csv-cell-data';
import validateUtilisationReportCells from './utilisation-report-cell-validators/helpers/validate-csv-cells';

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

    const { missingHeaderErrors, availableHeaders } = validateUtilisationReportCsvHeaders(csvData[0]);

    let dataValidationErrors = await validateUtilisationReportCsvCellData(csvData, availableHeaders);

    dataValidationErrors = validateUtilisationReportCells(csvData, dataValidationErrors);

    const expectedValidationErrors = missingHeaderErrors.concat(dataValidationErrors);

    expect(response).toEqual(expectedValidationErrors);
  });
});

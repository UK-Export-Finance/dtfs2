import { CURRENCY, UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-errors-for-mismatched-facility-values', () => {
  const field = 'base currency';
  const errorMessage = 'mock error message';

  const csvData = [
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBB', column: 'D', row: 1 },
      'facility utilisation': { value: '2000', column: 'F', row: 1 },
      exporter: { value: 'test exporter', column: 'C', row: 1 },
    },
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 2 },
      'bank facility reference': { value: 'test exporter 1', column: 'C', row: 2 },
      'base currency': { value: CURRENCY.GBP, column: 'D', row: 2 },
      'facility utilisation': { value: '20003', column: 'F', row: 2 },
      exporter: { value: 'test exporter 1', column: 'C', row: 2 },
    },
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 3 },
      'bank facility reference': { value: 'test exporter 1', column: 'C', row: 3 },
      'base currency': { value: 'EUR', column: 'D', row: 3 },
      'facility utilisation': { value: '20004', column: 'F', row: 3 },
      exporter: { value: 'test exporter 1', column: 'C', row: 3 },
    },
    {
      'ukef facility id': { value: '20001372', column: 'B', row: 4 },
      'bank facility reference': { value: 'test exporter 2', column: 'C', row: 4 },
      'base currency': { value: CURRENCY.GBP, column: 'D', row: 4 },
      'facility utilisation': { value: '3000', column: 'F', row: 4 },
      exporter: { value: 'test exporter 2', column: 'C', row: 4 },
    },
  ];

  const expectedErrors = [
    {
      errorMessage,
      column: 'D',
      row: 1,
      value: csvData[0][field].value,
      exporter: csvData[0].exporter.value,
    },
    {
      errorMessage,
      column: 'D',
      row: 2,
      value: csvData[1][field].value,
      exporter: csvData[1].exporter.value,
    },
    {
      errorMessage,
      column: 'D',
      row: 3,
      value: csvData[2][field].value,
      exporter: csvData[2].exporter.value,
    },
  ];

  it('should return the expected validation errors for all rows when calling generateErrorsForMismatchedFacilityValues when no errors are provided', () => {
    const errors = [] as UtilisationReportDataValidationError[];
    const row = csvData[0];

    const response = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage);

    expect(response).toEqual(expectedErrors);
  });

  it('should return an empty row when the required errors are provided', () => {
    const row = csvData[0];

    const response = generateErrorsForMismatchedFacilityValues(csvData, expectedErrors, row, field, errorMessage);

    expect(response).toEqual([]);
  });
});

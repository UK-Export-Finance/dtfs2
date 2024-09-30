import { UtilisationReportDataValidationError } from '@ukef/dtfs2-common';
import { generateErrorsForMismatchedFacilityValues } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-errors-for-mismatched-facility-values', () => {
  const field = 'base currency';
  const errorMessage = 'mock error message';
  const exporterName = 'mock name';

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
      'base currency': { value: 'GBP', column: 'D', row: 2 },
      'facility utilisation': { value: '20003', column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001371', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'EUR', column: 'D', row: 3 },
      'facility utilisation': { value: '20004', column: 'F', row: 1 },
    },
    {
      'ukef facility id': { value: '20001372', column: 'B', row: 1 },
      'bank facility reference': { value: 'test exporter', column: 'C', row: 1 },
      'base currency': { value: 'GBP', column: 'D', row: 4 },
      'facility utilisation': { value: '3000', column: 'F', row: 1 },
    },
  ];

  const expectedErrors = [
    {
      errorMessage,
      column: 'D',
      row: 1,
      value: csvData[0][field].value,
      exporter: exporterName,
    },
    {
      errorMessage,
      column: 'D',
      row: 2,
      value: csvData[1][field].value,
      exporter: exporterName,
    },
    {
      errorMessage,
      column: 'D',
      row: 3,
      value: csvData[2][field].value,
      exporter: exporterName,
    },
  ];

  it('should return the expected validation errors for all rows when calling generateErrorsForMismatchedFacilityValues when no errors are provided', () => {
    const errors = [] as UtilisationReportDataValidationError[];
    const row = csvData[0];

    const response = generateErrorsForMismatchedFacilityValues(csvData, errors, row, field, errorMessage, exporterName);

    expect(response).toEqual(expectedErrors);
  });

  it('should return an empty row when the required errors are provided', () => {
    const row = csvData[0];

    const response = generateErrorsForMismatchedFacilityValues(csvData, expectedErrors, row, field, errorMessage, exporterName);

    expect(response).toEqual([]);
  });
});

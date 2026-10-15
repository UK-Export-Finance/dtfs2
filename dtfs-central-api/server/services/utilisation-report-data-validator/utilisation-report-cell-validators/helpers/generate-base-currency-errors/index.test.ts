import { generateUtilisationReportMockCSVData } from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { addErrorOnEveryRow } from '../add-error-on-every-row';
import { generateBaseCurrencyErrors } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-base-currency-errors', () => {
  const errorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';
  const field = 'base currency';

  describe('when the base currency does not match', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');

    const rows = [csvData[0], csvData[1]] as UtilisationReportCsvRowData[];

    const completeRows = [
      {
        ...csvData[0],
        'base currency': {
          ...csvData[0]['base currency'],
          value: CURRENCY.GBP,
        },
      },
      {
        ...csvData[1],
        'base currency': {
          ...csvData[1]['base currency'],
          value: 'USD',
        },
      },
    ] as UtilisationReportCsvRowData[];

    it(`should return the result of "addErrorOnEveryRow" for "${field}"`, () => {
      // Act
      const result = generateBaseCurrencyErrors(rows, completeRows);

      // Assert
      const expectedErrors = addErrorOnEveryRow(rows, field, errorMessage);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when the base currency matches', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');

    const rows = [csvData[0], csvData[1]] as UtilisationReportCsvRowData[];

    const completeRows = [
      {
        ...csvData[0],
        'base currency': {
          ...csvData[0]['base currency'],
          value: CURRENCY.GBP,
        },
      },
      {
        ...csvData[1],
        'base currency': {
          ...csvData[1]['base currency'],
          value: CURRENCY.GBP,
        },
      },
    ] as UtilisationReportCsvRowData[];

    it(`should return an empty array for "${field}"`, () => {
      // Act
      const result = generateBaseCurrencyErrors(rows, completeRows);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

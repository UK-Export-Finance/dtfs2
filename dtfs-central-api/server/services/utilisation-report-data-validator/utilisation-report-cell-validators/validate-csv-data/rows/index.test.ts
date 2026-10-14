import { generateUtilisationReportMockCSVData, mockCurrencyValue, mockFacilityUtilisationValue } from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import { validateRows } from '.';
import { generateBaseCurrencyErrors } from '../../helpers/generate-base-currency-errors';
import { generateFacilityUtilisationErrors } from '../../helpers/generate-facility-utilisation-errors';

describe('validateRows', () => {
  describe('when the base currency and facility utilisation does not match for a facility', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '45');
    const rows = [
      {
        ...csvData[0],
        'base currency': { ...csvData[0]['base currency'], value: CURRENCY.GBP },
        'facility utilisation': { ...csvData[0]['facility utilisation'], value: '45' },
      },
      {
        ...csvData[1],
        'base currency': { ...csvData[1]['base currency'], value: 'USD' },
        'facility utilisation': { ...csvData[1]['facility utilisation'], value: '100' },
      },
    ] as UtilisationReportCsvRowData[];
    const completeRows = rows.filter((row) => row['base currency']?.value && row['facility utilisation']?.value);

    it('should return the result of "generateBaseCurrencyErrors" and "generateFacilityUtilisationErrors" for "base currency" and "facility utilisation"', () => {
      const expectedErrors = [...generateBaseCurrencyErrors(rows, completeRows), ...generateFacilityUtilisationErrors(rows, completeRows)];

      const result = validateRows(rows);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when the base currency does not match for a facility', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, mockFacilityUtilisationValue);
    const rows = [
      { ...csvData[0], 'base currency': { ...csvData[0]['base currency'], value: CURRENCY.GBP } },
      { ...csvData[1], 'base currency': { ...csvData[1]['base currency'], value: 'USD' } },
    ] as UtilisationReportCsvRowData[];
    const completeRows = rows.filter((row) => row['base currency']?.value && row['facility utilisation']?.value);

    it('should return the result of "generateBaseCurrencyErrors" for "base currency"', () => {
      const expectedErrors = generateBaseCurrencyErrors(rows, completeRows);

      const result = validateRows(rows);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when the facility utilisation does not match for a facility', () => {
    const csvData = generateUtilisationReportMockCSVData(mockCurrencyValue, '45');
    const rows = [
      { ...csvData[0], 'facility utilisation': { ...csvData[0]['facility utilisation'], value: '45' } },
      { ...csvData[1], 'facility utilisation': { ...csvData[1]['facility utilisation'], value: '100' } },
    ] as UtilisationReportCsvRowData[];
    const completeRows = rows.filter((row) => row['base currency']?.value && row['facility utilisation']?.value);

    it('should return the result of "generateFacilityUtilisationErrors" for "facility utilisation"', () => {
      const expectedErrors = generateFacilityUtilisationErrors(rows, completeRows);

      const result = validateRows(rows);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when both values match', () => {
    const csvData = generateUtilisationReportMockCSVData(mockCurrencyValue, mockFacilityUtilisationValue);

    it('should return an empty array', () => {
      const errors = validateRows(csvData);

      expect(errors).toEqual([]);
    });
  });
});

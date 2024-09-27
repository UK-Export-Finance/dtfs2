import { generateUtilisationReportMockCSVData, mockCurrencyValue, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateBaseCurrencyErrors } from '.';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-base-currency-errors', () => {
  const errorMessage = 'The currency does not match the other records for this facility. Enter the correct currency.';
  const field = 'base currency';
  const exporterName = 'test exporter';

  describe('when the base currency does not match', () => {
    const csvData = generateUtilisationReportMockCSVData('GBP', '100');
    const existingData = {
      baseCurrency: 'USD',
      facilityUtilisation: '1',
    };

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateBaseCurrencyErrors(mockCurrencyValue, [], csvData, csvData[1], 'test exporter', existingData);

      const currencyErrors = generateErrorsForMismatchedFacilityValues(csvData, [], csvData[0], field, errorMessage, exporterName);

      expect(result).toEqual(currencyErrors);
    });
  });

  describe('when the base currency matches', () => {
    const csvData = generateUtilisationReportMockCSVData('GBP', '100');
    const existingData = {
      baseCurrency: csvData[0]['base currency'].value,
      facilityUtilisation: csvData[0]['facility utilisation'].value,
    } as UtilisationReportFacilityData;

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateBaseCurrencyErrors(mockCurrencyValue, [], csvData, csvData[1], 'test exporter', existingData);

      expect(result).toEqual([]);
    });
  });
});

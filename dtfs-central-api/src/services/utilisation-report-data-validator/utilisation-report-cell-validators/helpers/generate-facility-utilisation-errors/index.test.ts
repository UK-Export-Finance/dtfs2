import { CURRENCY, generateUtilisationReportMockCSVData, mockFacilityUtilisationValue, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateFacilityUtilisationErrors } from '.';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-facility-utilisation-errors', () => {
  const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
  const field = 'facility utilisation';

  describe('when the facility utilisation does not match', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');
    const existingData = {
      baseCurrency: 'USD',
      facilityUtilisation: '1',
    };

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateFacilityUtilisationErrors(mockFacilityUtilisationValue, [], csvData, csvData[1], existingData);

      const currencyErrors = generateErrorsForMismatchedFacilityValues(csvData, [], csvData[0], field, errorMessage);

      expect(result).toEqual(currencyErrors);
    });
  });

  describe('when the facility utilisation matches', () => {
    const csvData = generateUtilisationReportMockCSVData(CURRENCY.GBP, '100');
    const existingData = {
      baseCurrency: csvData[0]['base currency'].value,
      facilityUtilisation: csvData[0]['facility utilisation'].value,
    } as UtilisationReportFacilityData;

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateFacilityUtilisationErrors(mockFacilityUtilisationValue, [], csvData, csvData[1], existingData);

      expect(result).toEqual([]);
    });
  });
});

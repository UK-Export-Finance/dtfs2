import { generateUtilisationReportMockCSVData, mockFacilityUtilisationValue, UtilisationReportFacilityData } from '@ukef/dtfs2-common';
import { generateFacilityUtilisationErrors } from '.';
import { generateErrorsForMismatchedFacilityValues } from '../generate-errors-for-mismatched-facility-values';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/generate-facility-utilisation-errors', () => {
  const errorMessage = 'The utilisation does not match the other records for this facility. Enter the correct utilisation.';
  const field = 'facility utilisation';
  const exporterName = 'test exporter';

  describe('when the facility utilisation does not match', () => {
    const csvData = generateUtilisationReportMockCSVData('GBP', '100');
    const existingData = {
      baseCurrency: 'USD',
      facilityUtilisation: '1',
    };

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateFacilityUtilisationErrors(existingData, mockFacilityUtilisationValue, [], csvData, csvData[1], exporterName);

      const currencyErrors = generateErrorsForMismatchedFacilityValues(csvData, [], csvData[0], field, errorMessage, exporterName);

      expect(result).toEqual(currencyErrors);
    });
  });

  describe('when the facility utilisation matches', () => {
    const csvData = generateUtilisationReportMockCSVData('GBP', '100');
    const existingData = {
      baseCurrency: csvData[0]['base currency'].value,
      facilityUtilisation: csvData[0]['facility utilisation'].value,
    } as UtilisationReportFacilityData;

    it(`should return the result of "generateErrorsForMismatchedFacilityValues" for "${field}"`, () => {
      const result = generateFacilityUtilisationErrors(existingData, mockFacilityUtilisationValue, [], csvData, csvData[1], exporterName);

      expect(result).toEqual([]);
    });
  });
});

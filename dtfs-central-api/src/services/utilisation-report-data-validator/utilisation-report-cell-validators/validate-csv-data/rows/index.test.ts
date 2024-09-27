import {
  UtilisationReportDataValidationError,
  UtilisationReportFacilityData,
  generateUtilisationReportMockCSVData,
  mockCurrencyValue,
  mockFacilityUtilisationValue,
} from '@ukef/dtfs2-common';
import { validateRows } from '.';
import { generateBaseCurrencyErrors } from '../../helpers/generate-base-currency-errors';
import { generateFacilityUtilisationErrors } from '../../helpers/generate-facility-utilisation-errors';

const exporterName = 'test exporter';

describe('validateRows', () => {
  describe('when the base currency and facility utilisation does not match for a facility', () => {
    const map = new Map<string, UtilisationReportFacilityData>();
    const csvData = generateUtilisationReportMockCSVData('GBP', '45');
    const ukefFacilityId = csvData[0]['ukef facility id']?.value as string;
    const errors = [] as UtilisationReportDataValidationError[];

    map.set(ukefFacilityId, {
      baseCurrency: mockCurrencyValue,
      facilityUtilisation: mockFacilityUtilisationValue,
    });

    it('should return the result of "generateBaseCurrencyErrors" and "generateFacilityUtilisationErrors" for "base currency" and "facility utilisation"', () => {
      const currencyErrors = generateBaseCurrencyErrors('GBP', errors, csvData, csvData[1], exporterName, map.get(ukefFacilityId));
      const expectedErrors = generateFacilityUtilisationErrors('1', currencyErrors, csvData, csvData[1], exporterName, map.get(ukefFacilityId));

      const result = validateRows(csvData);

      expect(result).toEqual(expectedErrors);
    });
  });

  describe('when the base currency does not match for a facility', () => {
    const csvData = generateUtilisationReportMockCSVData('GBP', mockFacilityUtilisationValue);
    const map = new Map<string, UtilisationReportFacilityData>();
    const ukefFacilityId = csvData[0]['ukef facility id']?.value as string;
    const errors = [] as UtilisationReportDataValidationError[];

    map.set(ukefFacilityId, {
      baseCurrency: mockCurrencyValue,
      facilityUtilisation: mockFacilityUtilisationValue,
    });

    it('should return the result of "generateBaseCurrencyErrors" for "base currency"', () => {
      const currencyErrors = generateBaseCurrencyErrors('GBP', errors, csvData, csvData[1], exporterName, map.get(ukefFacilityId));

      const result = validateRows(csvData);

      expect(result).toEqual(currencyErrors);
    });
  });

  describe('when the facility utilisation does not match for a facility', () => {
    const csvData = generateUtilisationReportMockCSVData(mockCurrencyValue, '45');
    const map = new Map<string, UtilisationReportFacilityData>();
    const ukefFacilityId = csvData[0]['ukef facility id']?.value as string;
    const errors = [] as UtilisationReportDataValidationError[];

    map.set(ukefFacilityId, {
      baseCurrency: mockCurrencyValue,
      facilityUtilisation: mockFacilityUtilisationValue,
    });

    it('should return the result of "generateFacilityUtilisationErrors" for "facility utilisation"', () => {
      const expectedErrors = generateFacilityUtilisationErrors('1', errors, csvData, csvData[1], exporterName, map.get(ukefFacilityId));

      const result = validateRows(csvData);

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

const mapFacilityValue = require('./mapFacilityValue');
const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { CURRENCY } = require('../../../../constants/currency.constant');

describe('mapFacilityValue', () => {
  beforeEach(() => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
  });

  describe('when no facility provided', () => {
    it('should return currency id and value', async () => {
      const mockFacility = {
        currency: { id: CURRENCY.GBP },
        value: '1,234',
      };

      const result = await mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        {},
      );

      const expected = `${CURRENCY.GBP} ${mockFacility.value}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is NOT GBP', () => {
    it('should return formatted facilityValueInGBP', async () => {
      const mockTfmFacility = {
        facilityValueInGBP: '22000',
      };

      const mockFacility = {
        currency: { id: 'USD' },
        value: '42000',
        tfm: mockTfmFacility,
      };

      const result = await mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(mockTfmFacility.facilityValueInGBP)}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is GBP', () => {
    it('should return formatted facilityValueInGBP', async () => {
      const mockTfmFacility = {
        facilityValueInGBP: '22000',
      };

      const mockFacility = {
        currency: { id: CURRENCY.GBP },
        value: '42000',
        tfm: mockTfmFacility,
      };

      const result = await mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacility.value)}`;
      expect(result).toEqual(expected);
    });
  });
});

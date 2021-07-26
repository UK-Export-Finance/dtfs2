const mapFacilityValue = require('./mapFacilityValue');
const { formattedNumber } = require('../../../../utils/number');

describe('mapFacilityValue', () => {
  describe('when facility currency is GBP', () => {
    it('should return currency id and facilityValue', () => {
      const mockFacility = {
        currency: { id: 'GBP' },
        facilityValue: '1,234',
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.facilityValue,
        {},
      );

      const expected = `GBP ${mockFacility.facilityValue}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is NOT GBP', () => {
    it('should return formatted facilityValueInGBP', () => {
      const mockFacility = {
        currency: { id: 'USD' },
        facilityValue: '42000',
      };

      const mockTfmFacility = {
        facilityValueInGBP: '22000',
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.facilityValue,
        mockTfmFacility,
      );

      const expected = `GBP ${formattedNumber(mockTfmFacility.facilityValueInGBP)}`;
      expect(result).toEqual(expected);
    });
  });
});

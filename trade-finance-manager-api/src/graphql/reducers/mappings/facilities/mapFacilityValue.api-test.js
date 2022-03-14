const mapFacilityValue = require('./mapFacilityValue');
const { formattedNumber } = require('../../../../utils/number');

describe('mapFacilityValue', () => {
  describe('when facility currency is GBP', () => {
    it('should return currency id and value', () => {
      const mockFacility = {
        currency: { id: 'GBP' },
        value: '1,234',
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        {},
      );

      const expected = `GBP ${mockFacility.value}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is NOT GBP', () => {
    it('should return formatted valueInGBP', () => {
      const mockFacility = {
        currency: { id: 'USD' },
        value: '42000',
      };

      const mockTfmFacility = {
        valueInGBP: '22000',
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockTfmFacility,
      );

      const expected = `GBP ${formattedNumber(mockTfmFacility.valueInGBP)}`;
      expect(result).toEqual(expected);
    });
  });
});

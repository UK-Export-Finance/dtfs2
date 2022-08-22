const mapFacilityValue = require('./mapFacilityValue');
const { formattedNumber } = require('../../../../utils/number');
const { CURRENCY } = require('../../../../constants/currency.constant');

describe('mapFacilityValue', () => {
  describe('when no facility provided', () => {
    it('should return currency id and value', () => {
      const mockFacility = {
        currency: { id: CURRENCY.GBP },
        value: '1,234',
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        {},
      );

      const expected = `${CURRENCY.GBP} ${mockFacility.value}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is NOT GBP', () => {
    it('should return formatted facilityValueInGBP', () => {
      const mockTfmFacility = {
        facilityValueInGBP: '22000',
      };

      const mockFacility = {
        currency: { id: 'USD' },
        value: '42000',
        tfm: mockTfmFacility,
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(mockTfmFacility.facilityValueInGBP)}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility currency is GBP', () => {
    it('should return formatted facilityValueInGBP', () => {
      const mockTfmFacility = {
        facilityValueInGBP: '22000',
      };

      const mockFacility = {
        currency: { id: CURRENCY.GBP },
        value: '42000',
        tfm: mockTfmFacility,
      };

      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacility.value)}`;
      expect(result).toEqual(expected);
    });
  });

  describe('amendment mapFacilityValue', () => {
    const mockTfmFacility = {
      facilityValueInGBP: '22000',
    };

    const mockFacility = {
      currency: { id: CURRENCY.GBP },
      value: '42000',
      tfm: mockTfmFacility,
      amendments: [{
        value: 2000,
      }],
    };

    it('should not add amendment facility value when amendment not complete', () => {
      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(mockFacility.value)}`;
      expect(result).toEqual(expected);
    });

    it('should add amendment facility value when amendment complete', () => {
      const amendmentValue = 2000;

      mockFacility.amendments[0].tfm = {
        value: {
          value: amendmentValue,
          currency: CURRENCY.GBP,
        },
      };
      const result = mapFacilityValue(
        mockFacility.currency.id,
        mockFacility.value,
        mockFacility,
      );

      const expected = `${CURRENCY.GBP} ${formattedNumber(amendmentValue)}`;
      expect(result).toEqual(expected);
    });
  });
});

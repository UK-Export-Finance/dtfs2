const currencyRule = require('./currency');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { currencyIsDisabled } = require('../currency');

jest.mock('../currency');

describe('validation - currency', () => {
  const errorList = {};

  describe('when the facility has no currency object', () => {
    it('should return validation error', () => {
      const result = currencyRule({});

      const expected = {
        currency: {
          order: orderNumber(errorList),
          text: 'Enter the Currency',
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the facility has no currency.id property', () => {
    it('should return validation error', () => {
      const mockFacility = {
        currency: {},
      };

      const result = currencyRule(mockFacility);

      const expected = {
        currency: {
          order: orderNumber(errorList),
          text: 'Enter the Currency',
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the facility has a currency that is disabled', () => {
    it('should return validation error', () => {
      jest.mocked(currencyIsDisabled).mockResolvedValueOnce(true);

      const mockFacility = {
        currency: {
          id: 'GBP',
        },
      };

      const result = currencyRule(mockFacility);

      const expected = {
        currency: {
          order: orderNumber(errorList),
          text: 'Facility currency is no longer available',
        },
      };

      expect(result).toEqual(expected);
    });
  });
});

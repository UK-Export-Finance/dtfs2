const currencyRule = require('./currency');
const { orderNumber } = require('../../../../utils/error-list-order-number');
const { currencyIsDisabled } = require('../currency');

jest.mock('../currency');

describe('validation - currency', () => {
  const errorList = {};

  const mockValidFacility = {
    currency: {
      id: 'GBP',
    },
  };

  describe('when the facility has no currency object', () => {
    it('should return a validation error', () => {
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
    it('should return a validation error', () => {
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
    beforeEach(() => {
      jest.mocked(currencyIsDisabled).mockReturnValueOnce(true);
    });

    afterEach(() => {
      currencyIsDisabled.mockRestore();
    });

    it('should return a validation error', () => {
      const result = currencyRule(mockValidFacility);

      const expected = {
        currency: {
          order: orderNumber(errorList),
          text: 'Facility currency is no longer available',
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the facility has a currency.id property', () => {
    beforeEach(() => {
      jest.mocked(currencyIsDisabled).mockReturnValueOnce(false);
    });

    afterEach(() => {
      currencyIsDisabled.mockRestore();
    });

    it('should return the provided validation errors', () => {
      const result = currencyRule(mockValidFacility);

      expect(result).toEqual(errorList);
    });
  });
});

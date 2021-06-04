const mapDealProduct = require('./mapDealProduct');
const CONSTANTS = require('../../../../../constants');

describe('mapDealProduct', () => {
  describe('when deal has only loan facilities', () => {
    it('should return loan product code', () => {
      const mockDeal = {
        facilities: [
          { facilityType: 'loan' },
          { facilityType: 'loan' },
        ],
      };

      const result = mapDealProduct(mockDeal);

      const expected = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN;

      expect(result).toEqual(expected);
    });
  });

  describe('when deal has only bond facilities', () => {
    it('should return bond product code', () => {
      const mockDeal = {
        facilities: [
          { facilityType: 'bond' },
          { facilityType: 'bond' },
        ],
      };

      const result = mapDealProduct(mockDeal);

      const expected = CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND;

      expect(result).toEqual(expected);
    });
  });

  describe('when deal has loan and bond facilities', () => {
    it('should return both product codes', () => {
      const mockDeal = {
        facilities: [
          { facilityType: 'loan' },
          { facilityType: 'bond' },
        ],
      };

      const result = mapDealProduct(mockDeal);

      const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;

      expect(result).toEqual(expected);
    });
  });
});

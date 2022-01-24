const dealProduct = require('./dealProduct');
const CONSTANTS = require('../../../constants');

describe('deal submit - add TFM data - deal product', () => {
  const mockBond = {
    _id: '1',
    type: 'Bond',
  };

  const mockLoan = {
    _id: '2',
    type: 'Loan',
  };

  describe('when there is only one bond facility', () => {
    it('should return bond product code', () => {
      const mockDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        facilities: [mockBond],
      };

      const result = dealProduct(mockDeal);

      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND);
    });
  });

  describe('when there is only one loan facility', () => {
    it('should return loan product code', () => {
      const mockDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        facilities: [mockLoan],
      };

      const result = dealProduct(mockDeal);

      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN);
    });
  });

  describe('when there are bond and loan facilities', () => {
    it('should return bond and loan product code', () => {
      const mockDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        facilities: [
          mockBond,
          mockLoan,
        ],
      };

      const result = dealProduct(mockDeal);

      const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it(`should return ${CONSTANTS.DEALS.DEAL_TYPE.GEF} dealType`, () => {
      const mockGefDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
      };

      const result = dealProduct(mockGefDeal);

      const expected = CONSTANTS.DEALS.DEAL_TYPE.GEF;
      expect(result).toEqual(expected);
    });
  });
});

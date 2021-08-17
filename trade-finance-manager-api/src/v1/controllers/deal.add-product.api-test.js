const {
  mapDealProduct,
  addDealProduct,
} = require('./deal.add-product');
const CONSTANTS = require('../../constants');

describe('deal submit - add-product', () => {
  const mockBond = {
    _id: '1',
    facilityType: 'bond',
  };

  const mockLoan = {
    _id: '2',
    facilityType: 'loan',
  };

  describe('mapDealProduct', () => {
    describe('when there is only one bond facility', () => {
      it('should return bond product code', () => {
        const mockDeal = {
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          facilities: [mockBond],
        };

        const result = mapDealProduct(mockDeal);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND);
      });
    });

    describe('when there is only one loan facility', () => {
      it('should return loan product code', () => {
        const mockDeal = {
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          facilities: [mockLoan],
        };

        const result = mapDealProduct(mockDeal);

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

        const result = mapDealProduct(mockDeal);

        const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;
        expect(result).toEqual(expected);
      });
    });

    describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
      it(`should return ${CONSTANTS.DEALS.DEAL_TYPE.GEF} dealType`, () => {
        const mockGefDeal = {
          dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        };

        const result = mapDealProduct(mockGefDeal);

        const expected = CONSTANTS.DEALS.DEAL_TYPE.GEF;
        expect(result).toEqual(expected);
      });
    });
  });

  describe('addDealProduct', () => {
    it('should add product to tfm object', async () => {
      const mockDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
        facilities: [
          mockBond,
          mockLoan,
        ],
      };

      const result = await addDealProduct(mockDeal);

      const expected = mapDealProduct(mockDeal);

      expect(result.tfm.product).toEqual(expected);
    });
  });
});

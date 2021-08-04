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

  const mockDeal = {
    facilities: [
      mockBond,
      mockLoan,
    ],
    tfm: {},
  };

  describe('mapDealProduct', () => {
    describe('when there is only one bond facility', () => {
      it('should return bond product code', () => {
        const result = mapDealProduct([mockBond]);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND);
      });
    });

    describe('when there is only one loan facility', () => {
      it('should return loan product code', () => {

        const result = mapDealProduct([mockLoan]);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN);
      });
    });

    describe('when there are bond and loan facilities', () => {
      it('should return bond and loan product code', () => {
        const result = mapDealProduct(mockDeal.facilities);

        const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;
        expect(result).toEqual(expected);
      });
    });
  });

  describe('addDealProduct', () => {
    it('should add product to tfm object', async () => {
      const result = await addDealProduct(mockDeal);

      const expected = mapDealProduct(mockDeal.facilities);

      expect(result.tfm.product).toEqual(expected);
    });
  });
});

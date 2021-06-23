const {
  mapDealProduct,
  addDealProduct,
} = require('./deal.add-product');
const CONSTANTS = require('../../constants');

describe('deal submit - add-product', () => {
  const mockDeal = {
    dealSnapshot: {
      bondTransactions: {
        items: [
          {
            _id: '1',
            facilityType: 'bond',
          },
        ],
      },
      loanTransactions: {
        items: [
          {
            _id: '2',
            facilityType: 'loan',
          },
        ],
      },
    },
    tfm: {},
  };

  describe('mapDealProduct', () => {
    describe('when there is only one bond facility', () => {
      it('should return bond product code', () => {
        const bondsArray = mockDeal.dealSnapshot.bondTransactions.items;

        const result = mapDealProduct(bondsArray);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND);
      });
    });

    describe('when there is only one loan facility', () => {
      it('should return loan product code', () => {
        const loansArray = mockDeal.dealSnapshot.loanTransactions.items;

        const result = mapDealProduct(loansArray);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN);
      });
    });

    describe('when there are bond and loan facilities', () => {
      it('should return bond and loan product code', () => {
        const allFacilities = [
          ...mockDeal.dealSnapshot.bondTransactions.items,
          ...mockDeal.dealSnapshot.loanTransactions.items,
        ];

        const result = mapDealProduct(allFacilities);

        const expected = `${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND} & ${CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN}`;
        expect(result).toEqual(expected);
      });
    });
  });

  describe('addDealProduct', () => {
    it('should add product to tfm object', async () => {
      const result = await addDealProduct(mockDeal);

      const allFacilities = [
        ...mockDeal.dealSnapshot.bondTransactions.items,
        ...mockDeal.dealSnapshot.loanTransactions.items,
      ];

      const expected = mapDealProduct(allFacilities);

      expect(result.tfm.product).toEqual(expected);
    });
  });
});

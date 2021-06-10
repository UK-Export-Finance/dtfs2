const {
  mapFacilityProductCode,
  mapFacilitiesArray,
  addFacilitiesArray,
} = require('./deal.add-facilities-array');
const CONSTANTS = require('../../constants');

describe('deal submit - add-facilities-array', () => {
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

  describe('mapFacilityProductCode', () => {
    describe('when facilityType is `bond`', () => {
      it('should return bond product code', () => {
        const bond = mockDeal.dealSnapshot.bondTransactions.items[0];
        const result = mapFacilityProductCode(bond.facilityType);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.BOND);
      });
    });

    describe('when facilityType is `loan`', () => {
      it('should return bond product code', () => {
        const loan = mockDeal.dealSnapshot.loanTransactions.items[0];
        const result = mapFacilityProductCode(loan.facilityType);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_PRODUCT_CODE.LOAN);
      });
    });
  });

  describe('mapFacilitiesArray', () => {
    it('should return an array of objects', () => {
      const allFacilities = [
        ...mockDeal.dealSnapshot.bondTransactions.items,
        ...mockDeal.dealSnapshot.loanTransactions.items,
      ];

      const result = mapFacilitiesArray(allFacilities);

      const expectedObj = (facility) => {
        const {
          _id,
          facilityType,
        } = facility;

        return {
          _id,
          facilityType,
          productCode: mapFacilityProductCode(facilityType),
        };
      };

      const expected = [
        expectedObj(mockDeal.dealSnapshot.bondTransactions.items[0]),
        expectedObj(mockDeal.dealSnapshot.loanTransactions.items[0]),
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('addFacilitiesArray', () => {
    it('should add array of objects to tfm.facilities', async () => {
      const result = await addFacilitiesArray(mockDeal);

      const allFacilities = [
        ...mockDeal.dealSnapshot.bondTransactions.items,
        ...mockDeal.dealSnapshot.loanTransactions.items,
      ];

      const expected = mapFacilitiesArray(allFacilities);

      expect(result.tfm.facilities).toEqual(expected);
    });
  });
});

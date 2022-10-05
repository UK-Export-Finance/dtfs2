const mapSubmittedDeal = require('.');
const mapBssEwcsDeal = require('./map-bss-ewcs-deal');
const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');
const mapGefDeal = require('./map-gef-deal');

const CONSTANTS = require('../../../constants');
const MOCK_BSS_EWCS_DEAL = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('mappings - map submitted deal - mapSubmittedDeal', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return mapBssEwcsDeal', async () => {
      const mockDeal = { dealSnapshot: MOCK_BSS_EWCS_DEAL };

      const result = await mapSubmittedDeal(mockDeal);

      const expected = {
        ...mapBssEwcsDeal(mockDeal),
        facilities: [
          ...mockDeal.dealSnapshot.bondTransactions.items.map((facility) => ({
            ...mapBssEwcsFacility(facility),
            coverEndDate: expect.any(Object), // date object

          })),
          ...mockDeal.dealSnapshot.loanTransactions.items.map((facility) => ({
            ...mapBssEwcsFacility(facility),
            coverEndDate: expect.any(Object), // date object
          })),
        ],
      };
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return mapGefDeal', async () => {
      const mockDeal = {
        dealSnapshot: {
          ...MOCK_GEF_DEAL,
          facilities: [],
        },
      };

      const result = await mapSubmittedDeal(mockDeal);

      const expected = await mapGefDeal(mockDeal);

      expect(result).toEqual(expected);
    });
  });
});

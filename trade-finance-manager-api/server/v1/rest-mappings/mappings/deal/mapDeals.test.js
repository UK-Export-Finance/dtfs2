const mapDeals = require('./mapDeals');
const CONSTANTS = require('../../../../constants');

describe('reducers - mappings - mapDeals', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return count with an array containing result of third function param', () => {
      const mockDeals = [
        {
          dealSnapshot: { dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF },
        },
      ];

      const mockMapBssDealFunc = () => ({});
      const mockMapGefDealFunc = jest.fn(() => ({ gef: true }));

      const deals = mapDeals(mockDeals, mockMapBssDealFunc, mockMapGefDealFunc);

      expect(deals).toEqual([mockMapGefDealFunc()]);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return count with an array containing result of second function param', () => {
      const mockDeals = [
        {
          dealSnapshot: { dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS },
        },
      ];

      const mockMapBssDealFunc = jest.fn(() => ({ bss: true }));
      const mockMapGefDealFunc = () => ({});

      const deals = mapDeals(mockDeals, mockMapBssDealFunc, mockMapGefDealFunc);

      expect(deals).toEqual([mockMapBssDealFunc()]);
    });
  });

  describe('when dealType is not recognised', () => {
    it('should return deal', () => {
      const mockDeals = [
        {
          dealSnapshot: { dealType: 'invalid type' },
        },
      ];

      const deals = mapDeals(mockDeals);

      expect(deals).toEqual(mockDeals);
    });
  });
});

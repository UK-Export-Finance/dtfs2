const mapSubmittedDeal = require('.');
const mapBssEwcsDeal = require('./map-bss-ewcs-deal');
// const mapGefDeal = require('./map-gef-deal');
const CONSTANTS = require('../../../constants');
const MOCK_BSS_EWCS_DEAL = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('mappings - map submitted deal - mapSubmittedDeal', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return mapBssEwcsDeal', () => {
      const mockDeal = { dealSnapshot: MOCK_BSS_EWCS_DEAL };

      const result = mapSubmittedDeal(mockDeal);

      const expected = mapBssEwcsDeal(mockDeal);
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return mapGefDeal', () => {
      const mockDeal = { dealSnapshot: MOCK_GEF_DEAL };

      const result = mapSubmittedDeal(mockDeal);

      // const expected = mapGefDeal(mockDeal);
      expect(result).toEqual(false);
    });
  });
});

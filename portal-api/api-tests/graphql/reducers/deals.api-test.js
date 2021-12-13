const dealsReducer = require('../../../src/graphql/reducers/deals');
const mapGefDeal = require('../../../src/graphql/mappings/map-gef-deal');
const CONSTANTS = require('../../../src/constants');

describe('/graphql reducers - deals', () => {
  describe(`when contains a deal that is ${CONSTANTS.DEAL.DEAL_TYPE.GEF}`, () => {
    it('should return result of mapGefDeal', () => {
      const mockDeals = [
        { dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF },
      ];

      const result = dealsReducer(mockDeals);

      const expected = [
        mapGefDeal(mockDeals[0]),
      ];

      expect(result).toEqual(expected);
    });
  });

  describe(`when contains a deal that is ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return the deal', () => {
      const mockDeals = [
        { dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS },
      ];

      const expected = [
        mockDeals[0],
      ];

      const result = dealsReducer(mockDeals);

      expect(result).toEqual(expected);
    });
  });

  describe(`when contains all deal types`, () => {
    it('should return all deals, mapped', () => {
      const mockDeals = [
        { dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF },
        { dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS },
      ];

      const expected = [
        mapGefDeal(mockDeals[0]),
        mockDeals[1],
      ];

      const result = dealsReducer(mockDeals);

      expect(result).toEqual(expected);
    });
  }); 

  describe(`when there are no deals`, () => {
    it('should return an empty array', () => {
      const result = dealsReducer([]);

      expect(result).toEqual([]);
    });
  }); 
});

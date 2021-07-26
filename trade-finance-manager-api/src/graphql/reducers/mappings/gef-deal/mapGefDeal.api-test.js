const mapGefDeal = require('./mapGefDeal');
const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: [
          {
            facilitySnapshot: MOCK_GEF_DEAL.facilities[0],
            tfm: {},
          },
        ],
      },
      tfm: {},
    };

    const result = mapGefDeal(mockDeal);

    const expected = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: mapGefDealSnapshot(mockDeal.dealSnapshot),
      tfm: {},
    };

    expect(result).toEqual(expected);
  });
});

const mapGefDeal = require('./mapGefDeal');
const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapDealTfm = require('../deal/dealTfm/mapDealTfm');

const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');

describe('mapGefDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: [
          {
            facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
            tfm: {},
          },
        ],
      },
      tfm: {},
    };

    const result = mapGefDeal(mockDeal);

    const expected = {
      _id: MOCK_GEF_DEAL._id,
      dealSnapshot: mapGefDealSnapshot(mockDeal.dealSnapshot, mockDeal.tfm),
      tfm: mapDealTfm(mockDeal),
    };

    expect(result).toEqual(expected);
  });
});

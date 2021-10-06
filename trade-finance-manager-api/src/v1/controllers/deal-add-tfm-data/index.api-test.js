const addTfmDealData = require('.');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const { dateReceived: addDateReceived } = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');
const MOCK_DEAL_AIN = require('../../__mocks__/mock-deal');
const DEFAULTS = require('../../defaults');

describe('deal submit - add TFM data', () => {
  it('returns an object with results from multiple functions', async () => {
    const mockDeal = mapSubmittedDeal({
      dealSnapshot: MOCK_DEAL_AIN,
      tfm: {},
    });

    const result = await addTfmDealData(mockDeal);

    const expected = {
      ...mockDeal,
      tfm: {
        dateReceived: addDateReceived(mockDeal.submissionDate),
        history: DEFAULTS.HISTORY,
        parties: {},
        product: addDealProduct(mockDeal),
        stage: addDealStage(mockDeal.status, mockDeal.submissionType),
        ...addDealPricingAndRisk(mockDeal),
      },
    };
    expect(result).toEqual(expected);
  });
});

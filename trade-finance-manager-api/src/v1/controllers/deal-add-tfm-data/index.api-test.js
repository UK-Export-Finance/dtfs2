const addTfmDealData = require('.');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const generateDateReceived = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');
const MOCK_DEAL_AIN = require('../../__mocks__/mock-deal');
const { mockUpdateDeal } = require('../../__mocks__/common-api-mocks');
const api = require('../../api');

describe('deal submit - add TFM data', () => {
  beforeEach(() => {
    api.updateDeal.mockReset();
    mockUpdateDeal();
  });
  
  afterAll(() => {
    api.updateDeal.mockReset();
  });

  it('returns an object with results from multiple functions', async () => {
    const mockDeal = mapSubmittedDeal({
      dealSnapshot: MOCK_DEAL_AIN,
      tfm: {},
    });

    const result = await addTfmDealData(mockDeal);

    const expected = {
      ...mockDeal,
      tfm: {
        ...generateDateReceived(),
        parties: {},
        activities: [],
        product: addDealProduct(mockDeal),
        stage: addDealStage(mockDeal.status, mockDeal.submissionType),
        ...addDealPricingAndRisk(mockDeal),
      },
    };
    expect(result).toEqual(expected);
  });
});

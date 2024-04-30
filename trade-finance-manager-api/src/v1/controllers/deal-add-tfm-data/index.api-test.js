const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const addTfmDealData = require('.');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const generateDateReceived = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');
const MOCK_DEAL_AIN = require('../../__mocks__/mock-deal');
const { mockUpdateDeal } = require('../../__mocks__/common-api-mocks');
const api = require('../../api');
const { MOCK_PORTAL_USERS } = require('../../__mocks__/mock-portal-users');

describe('deal submit - add TFM data', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      doNotFake: ['nextTick'],
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    api.updateDeal.mockReset();
    mockUpdateDeal();
  });

  it('returns an object with results from multiple functions', async () => {
    const mockDeal = mapSubmittedDeal({
      dealSnapshot: MOCK_DEAL_AIN,
      tfm: {},
    });

    const result = await addTfmDealData(mockDeal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));

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

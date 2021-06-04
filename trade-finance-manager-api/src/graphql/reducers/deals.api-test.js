/* eslint-disable no-underscore-dangle */
const dealsReducer = require('./deals');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

const MOCK_DEAL = require('../../v1/__mocks__/mock-deal-AIN-submitted');

const createMockDeal = (submissionDate) => ({
  ...MOCK_DEAL._id,
  dealSnapshot: {
    ...MOCK_DEAL,
    details: {
      ...MOCK_DEAL.details,
      submissionDate,
    },
  },
  tfm: {
    supplyContractValueInGBP: 1234,
  },
});

const expectedDealShape = (deal) => ({
  ...deal,
  dealSnapshot: {
    ...deal.dealSnapshot,
    submissionDetails: mapSubmissionDetails(deal.dealSnapshot.submissionDetails),
  },
  tfm: mapDealTfm(deal),
});

describe('reducer - deals', () => {
  it('should return deals sorted by most recent submissionDate', () => {
    const mockDeals = [
      createMockDeal(1606900616651),
      createMockDeal(1606900616652),
      createMockDeal(1606900616653),
      createMockDeal(1606900616654),
      createMockDeal(1606900616655),
    ];

    const result = dealsReducer(mockDeals);

    const expected = {
      count: mockDeals.length,
      deals: [
        expectedDealShape(createMockDeal(1606900616655)),
        expectedDealShape(createMockDeal(1606900616654)),
        expectedDealShape(createMockDeal(1606900616653)),
        expectedDealShape(createMockDeal(1606900616652)),
        expectedDealShape(createMockDeal(1606900616651)),
      ],
    };

    expect(result.count).toEqual(expected.count);
    expect(result.deals).toEqual(expected.deals);
  });
});

/* eslint-enable no-underscore-dangle */

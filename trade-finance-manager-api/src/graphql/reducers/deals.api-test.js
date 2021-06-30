/* eslint-disable no-underscore-dangle */
const dealsReducer = require('./deals');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

const MOCK_DEAL = require('../../v1/__mocks__/mock-deal-AIN-submitted');

const createMockDeal = (submissionDate, dealTfm) => ({
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
    ...dealTfm,
  },
});

const mockDealWithMappedFacilities = (dealTfm) => ({
  _id: MOCK_DEAL._id, // eslint-disable-line no-underscore-dangle
  dealSnapshot: {
    ...MOCK_DEAL,
    facilities: [
      ...MOCK_DEAL.bondTransactions.items,
      ...MOCK_DEAL.loanTransactions.items,
    ],
  },
  tfm: {
    supplyContractValueInGBP: 1234,
    ...dealTfm,
  },
});

const expectedDealShape = (deal, dealTfm) => ({
  _id: deal._id, // eslint-disable-line no-underscore-dangle
  dealSnapshot: {
    ...deal.dealSnapshot,
    submissionDetails: mapSubmissionDetails(deal.dealSnapshot.submissionDetails),
  },
  tfm: mapDealTfm(mockDealWithMappedFacilities(dealTfm)),
});

describe('reducer - deals', () => {
  it('should return deals', () => {
    const mockDeals = [
      createMockDeal(),
      createMockDeal(),
      createMockDeal(),
    ];

    const result = dealsReducer(mockDeals);

    const expected = {
      count: mockDeals.length,
      deals: [
        expectedDealShape(mockDeals[0]),
        expectedDealShape(mockDeals[1]),
        expectedDealShape(mockDeals[2]),
      ],
    };

    expect(result.count).toEqual(expected.count);
    expect(result.deals).toEqual(expected.deals);
  });
});

/* eslint-enable no-underscore-dangle */

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
  it('should return deals without sorting by default', () => {
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

  it('should return deals sorted by a given sortBy.field and order - submissionDate, ascending', () => {
    const mockDeals = [
      createMockDeal(1606900616651),
      createMockDeal(1606900616652),
      createMockDeal(1606900616653),
      createMockDeal(1606900616654),
      createMockDeal(1606900616655),
    ];

    const mockSortBy = {
      field: 'dealSnapshot.details.submissionDate',
      order: 'ascending',
    };

    const result = dealsReducer(mockDeals, mockSortBy);

    const expected = {
      count: mockDeals.length,
      deals: [
        expectedDealShape(createMockDeal(1606900616651)),
        expectedDealShape(createMockDeal(1606900616652)),
        expectedDealShape(createMockDeal(1606900616653)),
        expectedDealShape(createMockDeal(1606900616654)),
        expectedDealShape(createMockDeal(1606900616655)),
      ],
    };

    expect(result.count).toEqual(expected.count);
    expect(result.deals).toEqual(expected.deals);
  });

  it('should return deals sorted by a given sortBy.field and order - submissionDate, descending', () => {
    const mockDeals = [
      createMockDeal(1606900616651),
      createMockDeal(1606900616652),
      createMockDeal(1606900616653),
      createMockDeal(1606900616654),
      createMockDeal(1606900616655),
    ];

    const mockSortBy = {
      field: 'dealSnapshot.details.submissionDate',
      order: 'descending',
    };

    const result = dealsReducer(mockDeals, mockSortBy);

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

  it('should return deals sorted by a given sortBy.field and order - tfm.test, descending', () => {
    const mockDeals = [
      createMockDeal('', { test: 1 }),
      createMockDeal('', { test: 2 }),
      createMockDeal('', { test: 3 }),
      createMockDeal('', { test: 4 }),
      createMockDeal('', { test: 5 }),
    ];

    const mockSortBy = {
      field: 'tfm.test',
      order: 'descending',
    };

    const result = dealsReducer(mockDeals, mockSortBy);

    const expected = {
      count: mockDeals.length,
      deals: [
        expectedDealShape(createMockDeal('', { test: 5 }), { test: 5 }),
        expectedDealShape(createMockDeal('', { test: 4 }), { test: 4 }),
        expectedDealShape(createMockDeal('', { test: 3 }), { test: 3 }),
        expectedDealShape(createMockDeal('', { test: 2 }), { test: 2 }),
        expectedDealShape(createMockDeal('', { test: 1 }), { test: 1 }),
      ],
    };

    expect(result.count).toEqual(expected.count);
    expect(result.deals).toEqual(expected.deals);
  });
});

/* eslint-enable no-underscore-dangle */

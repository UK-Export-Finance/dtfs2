const mapDealSnapshot = require('./mapDealSnapshot');
const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');
const mapEligibility = require('./mapEligibility');
const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal-AIN-submitted');
const api = require('../../../../v1/api');

describe('mapDealSnapshot', () => {
  it('should return mapped object', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});

    const mockFacilities = [
      {
        facilitySnapshot: MOCK_DEAL.bondTransactions.items[0],
        tfm: {
          facilityValueInGBP: '123,45.00',
        },
      },
      {
        facilitySnapshot: MOCK_DEAL.loanTransactions.items[0],
        tfm: {
          facilityValueInGBP: '123,45.00',
        },
      },
    ];

    const mockDeal = {
      ...MOCK_DEAL._id,
      dealSnapshot: {
        ...MOCK_DEAL,
        facilities: mockFacilities,
      },
      tfm: {},
    };

    const result = await mapDealSnapshot(mockDeal);

    const expected = {
      ...mockDeal.dealSnapshot,
      submissionDetails: mapSubmissionDetails(MOCK_DEAL.submissionDetails),
      eligibility: mapEligibility(MOCK_DEAL.eligibility),
      facilities: await mapFacilities(mockFacilities, MOCK_DEAL.details, mockDeal.tfm),
      totals: await mapTotals(mockFacilities),
      isFinanceIncreasing: false,
    };

    expect(result).toEqual(expected);
  });
});

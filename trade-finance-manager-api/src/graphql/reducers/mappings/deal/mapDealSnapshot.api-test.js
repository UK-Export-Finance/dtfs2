const mapDealSnapshot = require('./mapDealSnapshot');
const mapTotals = require('./mapTotals');
const mapFacilities = require('../facilities/mapFacilities');
const mapSubmissionDetails = require('../../mapSubmissionDetails');
const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal-AIN-submitted');

describe('mapDealSnapshot', () => {
  it('should return mapped object', () => {
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

    const result = mapDealSnapshot(mockDeal);

    const expected = {
      ...mockDeal.dealSnapshot,
      totals: mapTotals(mockFacilities),
      facilities: mapFacilities(mockFacilities, MOCK_DEAL.details, mockDeal.tfm),
      submissionDetails: mapSubmissionDetails(MOCK_DEAL.submissionDetails),
      eligibilityCriteria: MOCK_DEAL.eligibility.criteria,
    };

    expect(result).toEqual(expected);
  });
});

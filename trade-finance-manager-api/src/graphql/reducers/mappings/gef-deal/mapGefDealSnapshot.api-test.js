const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');
const api = require('../../../../v1/api');

describe('mapGefDealSnapshot', () => {
  const mockFacilities = [
    {
      facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
      tfm: {
        facilityValueInGBP: '123,45.00',
      },
    },
  ];

  const mockDeal = {
    _id: MOCK_GEF_DEAL._id,
    dealSnapshot: {
      ...MOCK_GEF_DEAL,
      facilities: mockFacilities,
    },
    tfm: {},
  };

  it('should return mapped deal', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});

    const result = await mapGefDealSnapshot(mockDeal.dealSnapshot, mockDeal.tfm);

    const expected = {
      _id: MOCK_GEF_DEAL._id,
      dealType: MOCK_GEF_DEAL.dealType,
      status: MOCK_GEF_DEAL.status,
      updatedAt: MOCK_GEF_DEAL.updatedAt,
      isFinanceIncreasing: MOCK_GEF_DEAL.exporter.isFinanceIncreasing,
      submissionType: MOCK_GEF_DEAL.submissionType,
      maker: MOCK_GEF_DEAL.maker,
      bank: MOCK_GEF_DEAL.bank,
      exporter: {
        companyName: MOCK_GEF_DEAL.exporter.companyName,
      },
      bankInternalRefName: MOCK_GEF_DEAL.bankInternalRefName,
      additionalRefName: MOCK_GEF_DEAL.additionalRefName,
      details: mapGefDealDetails(mockDeal.dealSnapshot),
      submissionDetails: mapGefSubmissionDetails(mockDeal.dealSnapshot),
      eligibility: MOCK_GEF_DEAL.eligibility,
      supportingInformation: mockDeal.dealSnapshot.supportingInformation,
      facilities: await mapGefFacilities(mockDeal.dealSnapshot, mockDeal.tfm),
      totals: await mapTotals(mockDeal.dealSnapshot.facilities),
    };

    expect(result).toEqual(expected);
  });
});

/* eslint-disable no-underscore-dangle */
const {
  mapBssDeal,
  mapGefDeal,
  dealsReducer,
} = require('./deals');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapEligibility = require('./mappings/deal/mapEligibility');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapTotals = require('./mappings/deal/mapTotals');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');
const mapGefFacilities = require('./mappings/gef-facilities/mapGefFacilities');
const mapDeals = require('./mappings/deal/mapDeals');
const api = require('../../v1/api');

const MOCK_DEAL = require('../../v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');

const mockBssDeal = {
  ...MOCK_DEAL._id,
  dealSnapshot: {
    ...MOCK_DEAL,
    facilities: [
      {
        facilitySnapshot: MOCK_DEAL.bondTransactions.items[0],
        tfm: {},
      },
      {
        facilitySnapshot: MOCK_DEAL.loanTransactions.items[0],
        tfm: {},
      },
    ],
  },
  tfm: {
    supplyContractValueInGBP: 1234,
  },
};

const mockGefDeal = {
  _id: MOCK_GEF_DEAL._id,
  dealSnapshot: {
    ...MOCK_GEF_DEAL,
    facilities: [
      {
        facilitySnapshot: MOCK_GEF_DEAL.facilities[0],
        tfm: {},
      },
    ],
  },
  tfm: {},
};

describe('reducer - deals', () => {
  beforeEach(() => {
    api.getLatestCompletedValueAmendment = () => Promise.resolve({});
    api.getLatestCompletedDateAmendment = () => Promise.resolve({});
  });

  describe('mapBssDeal', () => {
    it('should return a mapped deal', async () => {
      const expected = {
        _id: mockBssDeal._id,
        dealSnapshot: {
          ...mockBssDeal.dealSnapshot,
          submissionDetails: mapSubmissionDetails(mockBssDeal.dealSnapshot.submissionDetails),
          facilities: await mapFacilities(
            mockBssDeal.dealSnapshot.facilities,
            mockBssDeal.dealSnapshot.details,
            mockBssDeal.tfm,
          ),
          supportingInformation: mockBssDeal.dealSnapshot.supportingInformation,
          eligibility: mapEligibility(mockBssDeal.dealSnapshot.eligibility),
          totals: await mapTotals(mockBssDeal.dealSnapshot.facilities),
        },
        tfm: mapDealTfm(mockBssDeal),
      };

      const result = await mapBssDeal(mockBssDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('mapGefDeal', () => {
    it('should return a mapped gef deal', async () => {
      const expected = {
        _id: mockGefDeal._id,
        dealSnapshot: {
          _id: mockGefDeal._id,
          bankInternalRefName: mockGefDeal.dealSnapshot.bankInternalRefName,
          additionalRefName: mockGefDeal.dealSnapshot.additionalRefName,
          dealType: mockGefDeal.dealSnapshot.dealType,
          submissionType: mockGefDeal.dealSnapshot.submissionType,
          exporter: {
            companyName: mockGefDeal.dealSnapshot.exporter.companyName,
          },
          facilitiesUpdated: mockGefDeal.dealSnapshot.facilitiesUpdated,
          eligibility: mockGefDeal.dealSnapshot.eligibility,
          bank: mockGefDeal.dealSnapshot.bank,
          details: mapGefDealDetails(mockGefDeal.dealSnapshot),
          submissionDetails: mapGefSubmissionDetails(mockGefDeal.dealSnapshot),
          facilities: await mapGefFacilities(mockGefDeal.dealSnapshot, mockGefDeal.tfm),
          supportingInformation: mockGefDeal.dealSnapshot.supportingInformation,
          totals: await mapTotals(mockGefDeal.dealSnapshot.facilities),
        },
        tfm: mapDealTfm(mockGefDeal),
      };

      const result = await mapGefDeal(mockGefDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('dealsLightReducer', () => {
    it('should return mapDeals result', async () => {
      const mockDeals = [
        mockBssDeal,
        mockBssDeal,
        mockBssDeal,
      ];

      const result = dealsReducer(mockDeals);

      const expected = mapDeals(
        mockDeals,
        mapBssDeal,
        await mapGefDeal,
      );

      expect(result).toEqual(expected);
    });
  });
});

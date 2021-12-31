/* eslint-disable no-underscore-dangle */
const {
  mapBssDeal,
  mapGefDeal,
  dealsLightReducer,
} = require('./deals-light');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');
const mapDeals = require('./mappings/deal/mapDeals');

const MOCK_DEAL = require('../../v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');

const mockBssDeal = {
  ...MOCK_DEAL._id,
  dealSnapshot: MOCK_DEAL,
  tfm: {
    supplyContractValueInGBP: 1234,
  },
};

const mockGefDeal = {
  _id: MOCK_GEF_DEAL._id,
  dealSnapshot: MOCK_GEF_DEAL,
  tfm: {},
};

describe('reducer - deals', () => {
  describe('mapBssDeal', () => {
    it('should return a mapped deal', () => {
      const expected = {
        _id: mockBssDeal._id,
        dealSnapshot: {
          submissionType: mockBssDeal.dealSnapshot.submissionType,
          bank: mockBssDeal.dealSnapshot.bank,
          details: mockBssDeal.dealSnapshot.details,
          submissionDetails: mapSubmissionDetails(mockBssDeal.dealSnapshot.submissionDetails),
          exporter: mockBssDeal.dealSnapshot.exporter,
        },
        tfm: mapDealTfm(mockBssDeal),
      };

      const result = mapBssDeal(mockBssDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('mapGefDeal', () => {
    it('should return a mapped gef deal', () => {
      const expected = {
        _id: mockGefDeal._id,
        dealSnapshot: {
          submissionType: mockGefDeal.dealSnapshot.submissionType,
          bank: mockGefDeal.dealSnapshot.bank,
          details: mapGefDealDetails(mockGefDeal.dealSnapshot),
          submissionDetails: mapGefSubmissionDetails(mockGefDeal.dealSnapshot),
          exporter: mockGefDeal.dealSnapshot.exporter,
        },
        tfm: mapDealTfm(mockGefDeal),
      };

      const result = mapGefDeal(mockGefDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('dealsLightReducer', () => {
    it('should return mapDeals result', () => {
      const mockDeals = [
        mockBssDeal,
        mockBssDeal,
        mockBssDeal,
      ];

      const result = dealsLightReducer(mockDeals);

      const expected = mapDeals(
        mockDeals,
        mapBssDeal,
        mapGefDeal,
      );

      expect(result).toEqual(expected);
    });
  });
});

/* eslint-enable no-underscore-dangle */

/* eslint-disable no-underscore-dangle */
const {
  mapDeal,
  mapGefDeal,
  mapDeals,
  dealsReducer,
} = require('./deals');
const mapSubmissionDetails = require('./mappings/deal/mapSubmissionDetails');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefSubmissionDetails = require('./mappings/gef-deal/mapGefSubmissionDetails');
const mapGefDealDetails = require('./mappings/gef-deal/mapGefDealDetails');

const MOCK_DEAL = require('../../v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');

const mockDeal = {
  ...MOCK_DEAL._id,
  dealSnapshot: {
    ...MOCK_DEAL,
    details: MOCK_DEAL.details,
  },
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
  describe('mapDeal', () => {
    it('should return a mapped deal', () => {
      const mockDealWithMappedFacilities = (deal) => ({
        _id: MOCK_DEAL._id, // eslint-disable-line no-underscore-dangle
        dealSnapshot: {
          ...MOCK_DEAL,
          facilities: [
            ...MOCK_DEAL.bondTransactions.items,
            ...MOCK_DEAL.loanTransactions.items,
          ],
        },
        tfm: deal.tfm,
      });

      const expected = {
        _id: mockDeal._id,
        dealSnapshot: {
          ...mockDeal.dealSnapshot,
          submissionDetails: mapSubmissionDetails(mockDeal.dealSnapshot.submissionDetails),
        },
        tfm: mapDealTfm(mockDealWithMappedFacilities(mockDeal)),
      };

      const result = mapDeal(mockDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('mapGefDeal', () => {
    it('should return a mapped gef deal', () => {
      const expected = {
        _id: mockGefDeal._id,
        dealSnapshot: {
          _id: mockGefDeal._id,
          details: mapGefDealDetails(mockGefDeal.dealSnapshot),
          submissionDetails: mapGefSubmissionDetails(mockGefDeal.dealSnapshot),
        },
        tfm: {},
      };

      const result = mapGefDeal(mockGefDeal);
      expect(result).toEqual(expected);
    });
  });

  describe('mapDeals', () => {
    it('should return array of mapped deal and gef deals', () => {
      const mockDeals = [
        mockDeal,
        mockGefDeal,
      ];

      const result = mapDeals(mockDeals);

      const expected = [
        mapDeal(mockDeals[0]),
        mapGefDeal(mockDeals[1]),
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('dealsReducer', () => {
    it('should return deals', () => {
      const mockDeals = [
        mockDeal,
        mockDeal,
        mockDeal,
      ];

      const result = dealsReducer(mockDeals);

      const expected = {
        count: mapDeals(mockDeals).length,
        deals: mapDeals(mockDeals),
      };

      expect(result.count).toEqual(expected.count);
      expect(result.deals).toEqual(expected.deals);
    });
  });
});

/* eslint-enable no-underscore-dangle */

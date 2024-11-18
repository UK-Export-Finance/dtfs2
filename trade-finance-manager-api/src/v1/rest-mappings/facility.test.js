import MOCK_DEAL_AIN_SUBMITTED from '../__mocks__/mock-deal-AIN-submitted';

const facilityReducer = require('./facility');
const mapFacilitySnapshot = require('./mappings/facilities/mapFacilitySnapshot');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacilitySnapshot = require('./mappings/gef-facilities/mapGefFacilitySnapshot');
const MOCK_GEF_DEAL = require('../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../__mocks__/mock-cash-contingent-facilities');

describe('reducer - facility', () => {
  describe('when facility is a BSS/EWCS facility', () => {
    it('should return correctly mapped facility object', () => {
      const mockDeal = {
        dealSnapshot: MOCK_DEAL_AIN_SUBMITTED,
        tfm: {},
      };

      const mockFacility = {
        _id: MOCK_DEAL_AIN_SUBMITTED.bondTransactions.items[0]._id,
        facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.bondTransactions.items[0],
        tfm: {
          facilityValueInGBP: '12,345.00',
        },
      };

      const result = facilityReducer(mockFacility, mockDeal.dealSnapshot, mockDeal.tfm);

      const expected = {
        _id: mockFacility._id,
        facilitySnapshot: mapFacilitySnapshot(mockFacility, mockDeal.dealSnapshot),
        tfm: mapFacilityTfm(mockFacility.tfm, {}, mockFacility),
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when facility is a GEF facility', () => {
    it('should return correctly mapped facility object', () => {
      const mockGefDeal = {
        dealSnapshot: MOCK_GEF_DEAL,
        tfm: {},
      };

      const mockGefFacility = {
        _id: MOCK_CASH_CONTINGENT_FACILITIES[0]._id,
        facilitySnapshot: MOCK_CASH_CONTINGENT_FACILITIES[0],
        tfm: {
          facilityValueInGBP: '12,345.00',
        },
      };

      const result = facilityReducer(mockGefFacility, mockGefDeal.dealSnapshot, mockGefDeal.tfm);

      const expected = {
        _id: mockGefFacility._id,
        facilitySnapshot: mapGefFacilitySnapshot(mockGefFacility, MOCK_GEF_DEAL),
        tfm: mapFacilityTfm(mockGefFacility.tfm, {}, mockGefFacility),
      };

      expect(result).toEqual(expected);
    });
  });
});

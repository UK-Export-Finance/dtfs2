const facilityReducer = require('./facility');
const mapFacility = require('./mappings/facilities/mapFacility');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacility = require('./mappings/gef-facilities/mapGefFacility');

const MOCK_DEAL_AIN_SUBMITTED = require('../../v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../v1/__mocks__/mock-cash-contingent-facilities');

describe('reducer - facility', () => {
  it('should return mapped object', () => {
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
      facilitySnapshot: mapFacility(
        mockFacility.facilitySnapshot,
        mockFacility.tfm,
        mockDeal.dealSnapshot.details,
        mockFacility,
      ),
      tfm: mapFacilityTfm(mockFacility.tfm, {}, mockFacility),
    };

    expect(result).toEqual(expected);
  });

  describe('when facility is a GEF facility (CASH/CONTINGENT)', () => {
    it('should return mapGefFacility', () => {
      const mockGefDeal = {
        dealSnapshot: MOCK_GEF_DEAL,
        tfm: {},
      };

      const mockGefFacility = {
        _id: MOCK_CASH_CONTINGENT_FACILIIES[0]._id,
        facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
        tfm: {
          facilityValueInGBP: '12,345.00',
        },
      };

      const result = facilityReducer(mockGefFacility, mockGefDeal.dealSnapshot, mockGefDeal.tfm);

      const expected = mapGefFacility(
        mockGefFacility,
        MOCK_GEF_DEAL,
        mockGefDeal.tfm,
      );

      expect(result).toEqual(expected);
    });
  });
});

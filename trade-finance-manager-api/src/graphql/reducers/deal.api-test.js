const dealReducer = require('./deal');
const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');
const mapGefDeal = require('./mappings/gef-deal/mapGefDeal');

const MOCK_DEAL_AIN_SUBMITTED = require('../../v1/__mocks__/mock-deal-AIN-submitted');
const MOCK_GEF_DEAL = require('../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../v1/__mocks__/mock-cash-contingent-facilities');

describe('reducer - deal', () => {
  it('should return mapped object', () => {
    const mockDeal = {
      _id: MOCK_DEAL_AIN_SUBMITTED._id,
      dealSnapshot: {
        ...MOCK_DEAL_AIN_SUBMITTED,
        facilities: [
          {
            facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.bondTransactions.items[0],
            tfm: {
              facilityValueInGBP: '12,345.00',
            },
          },
          {
            facilitySnapshot: MOCK_DEAL_AIN_SUBMITTED.loanTransactions.items[0],
            tfm: {
              facilityValueInGBP: '12,345.00',
            },
          },
        ],
      },
      tfm: {
        supplyContractValueInGBP: 1234,
      },
    };

    const result = dealReducer(mockDeal);

    const expected = {
      _id: mockDeal._id,
      dealSnapshot: mapDealSnapshot(mockDeal),
      tfm: mapDealTfm(mockDeal),
    };

    expect(result).toEqual(expected);
  });

  describe('when dealType is `GEF`', () => {
    it('should return mapGefDeal', async () => {
      const mockGefDeal = {
        _id: MOCK_GEF_DEAL._id,
        dealSnapshot: {
          ...MOCK_GEF_DEAL,
          facilities: [
            {
              facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
              tfm: {},
            },
          ],
        },
        tfm: {},
      };

      const result = dealReducer(mockGefDeal);

      const expected = mapGefDeal(mockGefDeal);

      expect(result).toEqual(expected);
    });
  });
});

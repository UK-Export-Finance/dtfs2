const dealReducer = require('./deal');
const mapDealSnapshot = require('./mappings/deal/mapDealSnapshot');
const mapDealTfm = require('./mappings/deal/dealTfm/mapDealTfm');

const MOCK_DEAL_AIN_SUBMITTED = require('../../v1/__mocks__/mock-deal-AIN-submitted');

describe('reducer - deal', () => {
  it('should return mapped object', () => {
    const mockDeal = {
      _id: MOCK_DEAL_AIN_SUBMITTED._id, // eslint-disable-line no-underscore-dangle
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
          }
        ],
      },
      tfm: {
        supplyContractValueInGBP: 1234,
      },
    };

    const result = dealReducer(mockDeal);

    const expected = {
      _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
      dealSnapshot: mapDealSnapshot(mockDeal),
      tfm: mapDealTfm(mockDeal),
    };

    expect(result).toEqual(expected);
  });
});

const api = require('../src/v1/api');

jest.mock('../src/v1/api');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const mapDeal = require('../src/v1/mappings/map-deal');
const dealReducer = require('../src/graphql/reducers/deal');

const MOCK_AUTHOR = {
  firstName: 'tester',
  lastName: 'smith',
  _id: 12243343242342,
};

const MOCK_DEAL_TFM = {
  exporterCreditRating: 'Good (BB-)',
  lossGivenDefault: '50%',
  stage: 'Confirmed',
  activities: [{
    type: 'COMMENT',
    timestamp: 13345665,
    text: 'test1',
    author: MOCK_AUTHOR,
    label: 'Comment added',
  }],
};

describe('graphql query - get deal', () => {
  it('should return a mapped deal via dealReducer', async () => {
    api.getLatestCompletedAmendmentValue = () => Promise.resolve({});
    api.getLatestCompletedAmendmentDate = () => Promise.resolve({});

    const mappedDeal = await mapDeal(MOCK_DEAL);

    const expectedDealWithoutFacilities = await dealReducer({
      dealSnapshot: mappedDeal,
      tfm: MOCK_DEAL_TFM,
    });
    delete expectedDealWithoutFacilities.facilities;
    expect(expectedDealWithoutFacilities).toEqual(expectedDealWithoutFacilities);
  });
});

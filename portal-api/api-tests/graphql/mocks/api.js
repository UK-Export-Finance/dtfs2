const {
  MOCK_ALL_DEALS,
  MOCK_DEALS,
 } = require('./deals');

const MOCK_API = {
  queryAllDeals: () => {
    const mockResponse = [
      {
        deals: MOCK_ALL_DEALS,
        count: MOCK_ALL_DEALS.length,
      },
    ];

    return Promise.resolve(mockResponse);
  },
};

module.exports = MOCK_API;

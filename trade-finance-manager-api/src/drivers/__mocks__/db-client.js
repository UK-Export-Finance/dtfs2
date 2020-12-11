const MOCK_DEAL = require('./mock-deal');

const MOCK_DEALS = [
  MOCK_DEAL,
];

module.exports = {
  getCollection: () => Promise.resolve({
    findOne: ({ _id: dealId }) => {
      const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
      return Promise.resolve(deal);
    },
  }),
};

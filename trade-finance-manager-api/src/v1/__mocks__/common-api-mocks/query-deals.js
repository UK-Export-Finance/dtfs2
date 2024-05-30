const { when } = require('jest-when');
const api = require('../../api');

module.exports = {
  mockQueryDeals: (dealsToReturn = [], paginationToReturn = {}) => {
    when(api.queryDeals)
      .calledWith(expect.anything())
      .mockImplementation(() => ({
        deals: dealsToReturn,
        pagination: paginationToReturn,
      }));
  },
};

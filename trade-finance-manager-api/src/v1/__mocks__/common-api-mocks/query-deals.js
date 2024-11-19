const { when } = require('jest-when');
const api = require('../../api');

export const mockQueryDeals = (dealsToReturn = [], paginationToReturn = {}) => {
  when(api.queryDeals)
    .calledWith(expect.anything())
    .mockImplementation(() => ({
      deals: dealsToReturn,
      pagination: paginationToReturn,
    }));
};

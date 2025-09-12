const { when } = require('jest-when');

const api = require('../../api');

module.exports = {
  mockFindOneDealFailure: () => {
    when(api.findOneDeal).calledWith(expect.anything()).mockResolvedValue(false);
  },
};

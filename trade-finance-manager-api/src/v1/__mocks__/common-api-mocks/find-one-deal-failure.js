const { when } = require('jest-when');

const api = require('../../api');

export const mockFindOneDealFailure = () => {
  when(api.findOneDeal).calledWith(expect.anything()).mockResolvedValue(false);
};

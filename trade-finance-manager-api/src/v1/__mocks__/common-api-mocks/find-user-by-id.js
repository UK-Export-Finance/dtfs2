const { when } = require('jest-when');
const api = require('../../api');
const MOCK_USERS = require('../mock-users');

module.exports = {
  mockFindUserById: (userIdCalledWith = undefined, user = undefined) => {
    const toBeCalledWith = userIdCalledWith || expect.anything();

    when(api.findUserById)
      .calledWith(toBeCalledWith)
      .mockImplementation((userId) => {
        if (user) {
          return user;
        }
        return MOCK_USERS.find((u) => u._id === userId);
      });
  },
};

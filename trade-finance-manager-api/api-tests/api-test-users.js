const { createApi } = require('./api');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

const loginTestUser = async (post, user) => {
  const {
    body: {
      token,
      user: { _id: userId },
    },
  } = await post({ username: user.username, password: user.password }).to('/v1/login');
  return { token, userId };
};

module.exports.initialise = async (app) => {
  const { post } = createApi(app).as();

  const mockUser = MOCK_USERS[0];

  let token;
  let userId;

  ({ token, userId } = await loginTestUser(post, mockUser));

  if (!token) {
    await post(mockUser).to('/v1/user');

    ({ token, userId } = await loginTestUser(post, mockUser));
  }

  return { ...mockUser, token, _id: userId };
};

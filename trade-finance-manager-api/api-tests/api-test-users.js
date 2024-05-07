const api = require('./api');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

module.exports.initialise = async (app) => {
  const { post } = api(app).as();

  const mockUser = MOCK_USERS[0];

  const { body } = await post({ username: MOCK_USERS[0].username, password: MOCK_USERS[0].password }).to('/v1/login');
  const { token } = body;

  if (token) {
    mockUser.token = token;

    return mockUser;
  }

  await post(mockUser).to('/v1/user');
  const { body: postBody } = await post({ username: MOCK_USERS[0].username, password: MOCK_USERS[0].password }).to(
    '/v1/login',
  );
  const { token: postToken } = postBody;

  mockUser.token = postToken;
  return mockUser;
};

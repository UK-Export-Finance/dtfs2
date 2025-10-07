const { ROLES } = require('@ukef/dtfs2-common');
const api = require('./api');
const tfmApi = require('./tfm/api');
const FailedToCreateLoggedInUserSessionError = require('./errors/failed-to-create-logged-in-user-session.error');

const mockDataLoaderUser = {
  username: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: [ROLES.MAKER, ROLES.ADMIN],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: { id: '*' },
  isTrusted: false,
};

const mockDataLoaderTFMUser = {
  username: 're-insert-mocks',
  password: 'AbC!2345',
  firstName: 'Mock',
  lastName: 'DataLoader',
  teams: [],
  email: 're-insert-mocks-data-loader-tfm@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
};

const createAndLogInAsInitialUser = async () => {
  console.info('Initial user');
  try {
    return await api.loginViaPortal(mockDataLoaderUser);
  } catch (error) {
    console.error('❌ Login failed for initial user, creating initial user');
    await api.createMockLoaderUser(mockDataLoaderUser);
    return api.loginViaPortal(mockDataLoaderUser);
  }
};

const deleteInitialUser = async (token) => {
  console.info('Initial user');
  const allUsers = await api.listUsers(token);
  const userToDelete = allUsers.find((user) => user.username === mockDataLoaderUser.username);
  await api.deleteUser(userToDelete, token);
};

const createAndLogInAsInitialTfmUser = async () => {
  try {
    console.info('Initial user');
    const token = await api.loginTfmUser(mockDataLoaderTFMUser);

    if (!token) {
      throw new FailedToCreateLoggedInUserSessionError({
        username: mockDataLoaderTFMUser.username,
        cause: 'No token was present on response',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Login failed for initial user %o, recreating.', error);
    await api.createInitialTfmUser(mockDataLoaderTFMUser);
    return api.loginTfmUser(mockDataLoaderTFMUser);
  }
};

const deleteInitialTFMUser = async (token) => {
  console.info('Initial user');
  const allUsers = await tfmApi.listUsers(token);
  const userToDelete = allUsers.filter((user) => user.username === 're-insert-mocks');

  for (const user of userToDelete) {
    await tfmApi.deleteUser(user);
  }
};

module.exports = {
  mockDataLoaderUser,
  createAndLogInAsInitialTfmUser,
  createAndLogInAsInitialUser,
  deleteInitialUser,
  deleteInitialTFMUser,
};

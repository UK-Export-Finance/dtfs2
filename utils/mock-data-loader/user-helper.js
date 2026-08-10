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
  try {
    return await api.loginViaPortal(mockDataLoaderUser);
  } catch (error) {
    console.error('❌ Login failed for primary mock loader user, creating primary mock loader user');
    await api.createMockLoaderUser(mockDataLoaderUser);
    return api.loginViaPortal(mockDataLoaderUser);
  }
};

const deleteInitialUser = async (token) => {
  const allUsers = await api.listUsers(token);
  const userToDelete = allUsers.find((user) => user.username === mockDataLoaderUser.username);
  await api.deleteUser(userToDelete, token);
};

const createAndLogInAsInitialTfmUser = async () => {
  try {
    const token = await api.loginTfmUser(mockDataLoaderTFMUser);

    if (!token) {
      throw new FailedToCreateLoggedInUserSessionError({
        username: mockDataLoaderTFMUser.username,
        cause: 'No token was present on response',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Login failed for primary TFM mock loader user, recreating.');
    await api.createInitialTfmUser(mockDataLoaderTFMUser);
    return api.loginTfmUser(mockDataLoaderTFMUser);
  }
};

const deleteInitialTFMUser = async (token) => {
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

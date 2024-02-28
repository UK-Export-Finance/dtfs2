const api = require('./api');
const tfmApi = require('./tfm/api');
const { MAKER, ADMIN } = require('./portal/roles');
const FailedToCreateLoggedInUserSessionError = require('./errors/failed-to-create-logged-in-user-session.error');
const { LOGGER_COLOURS, logger } = require('./helpers/logger.helper');

const mockDataLoaderUser = {
  username: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: [MAKER, ADMIN],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: { id: '*' },
  timezone: 'Europe/London',
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
  logger({ message: 'logging in as initial portal user' });
  try {
    return await api.loginViaPortal(mockDataLoaderUser);
  } catch (error) {
    logger({
      message: `login failed for initial portal user:\
    \n    ${error.message}\nrecreating initial portal user`,
      colour: LOGGER_COLOURS.yellow,
      depth: 1,
    });
    await api.createInitialUser(mockDataLoaderUser);
    return api.loginViaPortal(mockDataLoaderUser);
  }
};

const deleteInitialUser = async (token) => {
  logger({ message: 'deleting initial Portal user' });
  const allUsers = await api.listUsers(token);
  const userToDelete = allUsers.find((user) => user.username === mockDataLoaderUser.username);
  await api.deleteUser(userToDelete, token);
};

const createAndLogInAsInitialTfmUser = async () => {
  try {
    logger({ message: 'logging in as initial TFM user' });
    const token = await api.loginTfmUser(mockDataLoaderTFMUser);

    if (!token) {
      throw new FailedToCreateLoggedInUserSessionError({ username: mockDataLoaderTFMUser.username, cause: 'No token was present on response' });
    }

    return token;
  } catch (error) {
    logger({
      message: `login failed for initial TFM user:\
        \n    ${error.message}\nrecreating initial TFM user`,
      depth: 1,
      colour: LOGGER_COLOURS.yellow,
    });
    await api.createInitialTfmUser(mockDataLoaderTFMUser);
    return api.loginTfmUser(mockDataLoaderTFMUser);
  }
};

const deleteInitialTFMUser = async (token) => {
  logger({ message: 'deleting initial TFM user' });
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

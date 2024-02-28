const api = require('./api');
const tfmApi = require('./tfm/api');
const { MAKER, ADMIN } = require('./portal/roles');
const FailedToCreateLoggedInUserSessionError = require('./errors/failed-to-create-logged-in-user-session.error');

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
  console.info('Portal login as user %s', mockDataLoaderUser.username);
  try {
    return await api.loginViaPortal(mockDataLoaderUser);
  } catch (error) {
    console.info(
      // cspell:disable-next-line
      `\u001b[1;33mlogin failed for initial portal user ${mockDataLoaderUser.username}:\
        \n  - ${error.message}\nrecreating initial portal user ${mockDataLoaderUser.username}\x1b[0m`,
    );
    await api.createInitialUser(mockDataLoaderUser);
    return api.loginViaPortal(mockDataLoaderUser);
  }
};

const deleteInitialUser = async (token) => {
  const allUsers = await api.listUsers(token);
  const userToDelete = allUsers.find((user) => user.username === mockDataLoaderUser.username);
  console.info(`deleting user ${userToDelete.username}`);
  await api.deleteUser(userToDelete, token);
};

const createAndLogInAsInitialTfmUser = async () => {
  try {
    console.info('TFM login as user %s', mockDataLoaderTFMUser.username);
    const token = await api.loginTfmUser(mockDataLoaderTFMUser);

    if (!token) {
      throw new FailedToCreateLoggedInUserSessionError({ username: mockDataLoaderTFMUser.username, cause: 'No token was present on response' });
    }

    return token;
  } catch (error) {
    console.info(
      // cspell:disable-next-line
      `\u001b[1;33mlogin failed for initial TFM user ${mockDataLoaderTFMUser.username}:\
        \n  - ${error.message}\nrecreating initial TFM user ${mockDataLoaderTFMUser.username}\x1b[0m`,
    );
    await api.createInitialTfmUser(mockDataLoaderTFMUser);
    return api.loginTfmUser(mockDataLoaderTFMUser);
  }
};

const deleteInitialTFMUser = async (token) => {
  const allUsers = await tfmApi.listUsers(token);
  const userToDelete = allUsers.filter((user) => user.username === 're-insert-mocks');

  for (const user of userToDelete) {
    console.info(`deleting tfm user ${user.username}`);
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

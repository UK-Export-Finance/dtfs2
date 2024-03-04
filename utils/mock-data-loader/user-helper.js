const api = require('./api');
const tfmApi = require('./tfm/api');
const { MAKER, ADMIN } = require('./portal/roles');

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
  } catch {
    console.info('Creating portal user %s', mockDataLoaderUser.username);
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
  console.info('TFM login as user %s', mockDataLoaderTFMUser.username);
  let token = await api.loginTfmUser(mockDataLoaderTFMUser);

  if (!token) {
    console.info('Creating TFM user %s', mockDataLoaderTFMUser.username);

    await api.createInitialTfmUser(mockDataLoaderTFMUser);
    token = await api.loginTfmUser(mockDataLoaderTFMUser);
  }

  return token;
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

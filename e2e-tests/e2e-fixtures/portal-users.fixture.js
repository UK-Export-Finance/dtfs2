const { getCypressEnvVariable } = require('./get-cypress-env-variable.fixture');
const { CYPRESS_ENV_KEY } = require('./cypress-env-keys.fixture');

const MOCK_USERS = getCypressEnvVariable(CYPRESS_ENV_KEY.MOCK_USERS);
const ROLES = getCypressEnvVariable(CYPRESS_ENV_KEY.ROLES);

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: [ROLES.MAKER],
};

module.exports = {
  ...MOCK_USERS,
  READ_ONLY_ALL_BANKS: MOCK_USERS.READ_ONLY,
  USER_WITH_INJECTION,
};

const MOCK_USERS = require('../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../utils/mock-data-loader/tfm/mocks/users');

const BANK1_MAKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const BANK1_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK2_MAKER2');

const BANK1_READ_ONLY = MOCK_USERS.find((user) => user.username === 'BANK1_READ_ONLY');

const BANK3_GEF_MAKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK3_GEF_MAKER1'));

const BANK1_CHECKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('checker')) && user.username === 'BANK1_CHECKER1');

const ADMIN = MOCK_USERS.find((user) =>
  user.username === 'ADMIN');

// TFM
const UNDERWRITER_MANAGER = MOCK_TFM_USERS.find((user) =>
  user.teams.includes('UNDERWRITER_MANAGERS'));

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: ['maker'],
};

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK1_READ_ONLY,
  BANK2_MAKER2,
  BANK3_GEF_MAKER1,
  BANK1_CHECKER1,
  ADMIN,
  UNDERWRITER_MANAGER,
  USER_WITH_INJECTION,
};

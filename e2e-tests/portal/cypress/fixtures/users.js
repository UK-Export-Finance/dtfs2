const MOCK_USERS = require('../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../utils/mock-data-loader/tfm/mocks/users');
const { USER_ROLES } = require('./constants');

const BANK1_MAKER1 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.MAKER) && user.username === 'BANK1_MAKER1');

const BANK1_MAKER2 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.MAKER) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.MAKER) && user.username === 'BANK2_MAKER2');

const BANK3_GEF_MAKER1 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.MAKER) && user.username === 'BANK3_GEF_MAKER1');

const BANK1_CHECKER1 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.CHECKER) && user.username === 'BANK1_CHECKER1');

const BANK1_READ_ONLY1 = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.READ_ONLY) && user.username === 'BANK1_READ_ONLY1');

const ADMIN = MOCK_USERS.find((user) => user.username === 'ADMIN');

const READ_ONLY_ALL_BANKS = MOCK_USERS.find((user) => user.roles.includes(USER_ROLES.READ_ONLY) && user.username === 'READ_ONLY' && user.bank.id === '*');

// TFM
const UNDERWRITER_MANAGER = MOCK_TFM_USERS.find((user) => user.teams.includes('UNDERWRITER_MANAGERS'));

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: [USER_ROLES.MAKER],
};

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  BANK3_GEF_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
  ADMIN,
  UNDERWRITER_MANAGER,
  USER_WITH_INJECTION,
  READ_ONLY_ALL_BANKS,
};

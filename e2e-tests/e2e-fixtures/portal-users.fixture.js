const USERS = require('../../utils/mock-data-loader/portal/users');
const { PORTAL_USER_ROLES } = require('./constants.fixture');

const BANK1_MAKER1 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK1_MAKER1');

const BANK1_MAKER2 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK2_MAKER2');

const BANK3_GEF_MAKER1 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK3_GEF_MAKER1');

const BANK1_CHECKER1 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.CHECKER) && user.username === 'BANK1_CHECKER1');

const BANK1_READ_ONLY1 = USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.READ_ONLY) && user.username === 'BANK1_READ_ONLY1');

const ADMIN = USERS.find((user) => user.username === 'ADMIN');

const READ_ONLY_ALL_BANKS = USERS.find(
  (user) => user.roles.includes(PORTAL_USER_ROLES.READ_ONLY) && user.username === 'READ_ONLY' && user.bank.id === '*',
);

const BANK1_MAKER_CHECKER1 = USERS.find(
  (user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.roles.includes(PORTAL_USER_ROLES.CHECKER) && user.username === 'BANK1_MAKER_CHECKER1',
);

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: [PORTAL_USER_ROLES.MAKER],
};

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  BANK3_GEF_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
  ADMIN,
  USER_WITH_INJECTION,
  READ_ONLY_ALL_BANKS,
  BANK1_MAKER_CHECKER1,
};

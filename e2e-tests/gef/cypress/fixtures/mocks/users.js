const MOCK_PORTAL_USERS = require('../../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../../utils/mock-data-loader/tfm/mocks/users');

const { USER_ROLES } = require('../constants');

const BANK1_MAKER1 = MOCK_PORTAL_USERS.find((user) => user.roles.includes(USER_ROLES.MAKER) && user.username === 'BANK1_MAKER1');

const BANK1_CHECKER1 = MOCK_PORTAL_USERS.find((user) => user.roles.includes(USER_ROLES.CHECKER && user.username === 'BANK1_CHECKER1'));

const ADMIN = MOCK_PORTAL_USERS.find((user) => user.roles.includes(USER_ROLES.ADMIN) && user.username === 'ADMIN');

const READ_ONLY = MOCK_PORTAL_USERS.find((user) => user.roles.includes(USER_ROLES.READ_ONLY) && user.username === 'READ_ONLY');

// TFM Users
const T1_USER_1 = MOCK_TFM_USERS.find((user) => user.username === 'T1_USER_1');

module.exports = {
  BANK1_MAKER1,
  BANK1_CHECKER1,
  ADMIN,
  READ_ONLY,
  T1_USER_1,
};

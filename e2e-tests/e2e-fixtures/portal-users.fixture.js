const USERS = require('../../utils/mock-data-loader/portal/users');
const { PORTAL_USER_ROLES } = require('./constants.fixture');

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
  ...USERS,
  READ_ONLY_ALL_BANKS: USERS.READ_ONLY,
  USER_WITH_INJECTION,
};

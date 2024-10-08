const { PORTAL_USER_ROLES } = require('./constants.fixture');
const MOCK_USERS = require('../../utils/mock-data-loader/portal-users');

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: [PORTAL_USER_ROLES.MAKER],
};

// This is used when a valid ObjectId is needed (e.g. TFM endpoint `submitDealAfterUkefIds`)
// The given _id is mocked & does not correspond to the value in the database
const BANK1_CHECKER1_WITH_MOCK_ID = {
  ...MOCK_USERS.BANK1_CHECKER1,
  _id: '1234567890abcdef12345678',
};

module.exports = {
  ...MOCK_USERS,
  READ_ONLY_ALL_BANKS: MOCK_USERS.READ_ONLY,
  USER_WITH_INJECTION,
  BANK1_CHECKER1_WITH_MOCK_ID,
};

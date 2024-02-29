const { MOCK_USERS, ROLES } = require('@ukef/dtfs2-common');

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

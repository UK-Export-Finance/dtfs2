const {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  BANK3_GEF_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
  BANK1_PAYMENT_REPORT_OFFICER1,
  BANK1_MAKER_PAYMENT_REPORT_OFFICER1,
  ADMIN,
  ADMINNOMAKER,
} = require('../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../utils/mock-data-loader/tfm/mocks/users');
const { USER_ROLES } = require('./constants');

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
  BANK1_PAYMENT_REPORT_OFFICER1,
  BANK1_MAKER_PAYMENT_REPORT_OFFICER1,
  ADMIN,
  ADMINNOMAKER,
  UNDERWRITER_MANAGER,
  USER_WITH_INJECTION,
};

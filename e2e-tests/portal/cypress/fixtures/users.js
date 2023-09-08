const MOCK_USERS = require('../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../utils/mock-data-loader/tfm/mocks/users');

const BANK1_MAKER1 = MOCK_USERS.find((user) => user.roles.includes('maker') && user.username === 'BANK1_MAKER1');

const BANK1_MAKER2 = MOCK_USERS.find((user) => user.roles.includes('maker') && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) => user.roles.includes('maker') && user.username === 'BANK2_MAKER2');

const BANK3_GEF_MAKER1 = MOCK_USERS.find((user) => user.roles.includes('maker') && user.username === 'BANK3_GEF_MAKER1');

const BANK1_CHECKER1 = MOCK_USERS.find((user) => user.roles.includes('checker') && user.username === 'BANK1_CHECKER1');

const BANK1_READ_ONLY1 = MOCK_USERS.find((user) => user.roles.includes('read-only') && user.username === 'BANK1_READ_ONLY1');

const ADMIN = MOCK_USERS.find((user) => user.username === 'ADMIN');

const UKEF_OPERATIONS = MOCK_USERS.find((user) => user.username === 'UKEF_OPERATIONS');

const EDITOR = MOCK_USERS.find((user) => user.username === 'EDITOR');

// TFM
const UNDERWRITER_MANAGER = MOCK_TFM_USERS.find((user) => user.teams.includes('UNDERWRITER_MANAGERS'));

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
  BANK2_MAKER2,
  BANK3_GEF_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
  ADMIN,
  UKEF_OPERATIONS,
  EDITOR,
  UNDERWRITER_MANAGER,
  USER_WITH_INJECTION,
};

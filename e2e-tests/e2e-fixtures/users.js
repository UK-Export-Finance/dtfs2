const MOCK_USERS = require('../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../utils/mock-data-loader/tfm/mocks/users');
const { PORTAL_USER_ROLES, TFM_USER_TEAMS } = require('./constants.fixture');

const BANK1_MAKER1 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK1_MAKER1');

const BANK1_MAKER2 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK2_MAKER2');

const BANK3_GEF_MAKER1 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.MAKER) && user.username === 'BANK3_GEF_MAKER1');

const BANK1_CHECKER1 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.CHECKER) && user.username === 'BANK1_CHECKER1');

const BANK1_READ_ONLY1 = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.READ_ONLY) && user.username === 'BANK1_READ_ONLY1');

const ADMIN = MOCK_USERS.find((user) => user.username === 'ADMIN');

const READ_ONLY_ALL_BANKS = MOCK_USERS.find((user) => user.roles.includes(PORTAL_USER_ROLES.READ_ONLY) && user.username === 'READ_ONLY' && user.bank.id === '*');

const USER_WITH_INJECTION = {
  username: '{ "$gt": "" }',
  email: '{ "$gt": "" }',
  password: 'TestPassword123!',
  firstname: 'test',
  surname: 'injection',
  bank: 'HSBC',
  roles: [PORTAL_USER_ROLES.MAKER],
};

// TFM
const UNDERWRITER_MANAGER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITER_MANAGER) && user.username === 'UNDERWRITER_MANAGER_1');

const UNDERWRITER_MANAGER_2 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITER_MANAGER) && user.username === 'UNDERWRITER_MANAGER_2');

const UNDERWRITER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITERS) && user.username === 'UNDERWRITER_1');

const BUSINESS_SUPPORT_USER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.BUSINESS_SUPPORT) && user.username === 'BUSINESS_SUPPORT_USER_1');

const BUSINESS_SUPPORT_USER_2 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.BUSINESS_SUPPORT) && user.username === 'BUSINESS_SUPPORT_USER_2');

const T1_USER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.TEAM1) && user.username === 'T1_USER_1');

const RISK_MANAGER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.RISK_MANAGERS) && user.username === 'RISK_MANAGER_1');

const UNDERWRITING_SUPPORT_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITING_SUPPORT) && user.username === 'UNDERWRITING_SUPPORT_1');

const PIM_USER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.PIM) && user.username === 'PIM_USER_1');

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
  UNDERWRITER_MANAGER: UNDERWRITER_MANAGER_1,
  UNDERWRITER_MANAGER_1,
  UNDERWRITER_MANAGER_2,
  UNDERWRITER_1,
  BUSINESS_SUPPORT_USER_1,
  BUSINESS_SUPPORT_USER_2,
  T1_USER_1,
  RISK_MANAGER_1,
  UNDERWRITING_SUPPORT_1,
  PIM_USER_1,
};

const MOCK_TFM_USERS = require('../../utils/mock-data-loader/tfm/mocks/users');
const { TFM_USER_TEAMS } = require('./constants.fixture');

const UNDERWRITER_MANAGER_1 = MOCK_TFM_USERS.find(
  (user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITER_MANAGERS) && user.username === 'UNDERWRITER_MANAGER_1',
);

const UNDERWRITER_MANAGER_2 = MOCK_TFM_USERS.find(
  (user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITER_MANAGERS) && user.username === 'UNDERWRITER_MANAGER_2',
);

const UNDERWRITER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITERS) && user.username === 'UNDERWRITER_1');

const BUSINESS_SUPPORT_USER_1 = MOCK_TFM_USERS.find(
  (user) => user.teams.includes(TFM_USER_TEAMS.BUSINESS_SUPPORT) && user.username === 'BUSINESS_SUPPORT_USER_1',
);

const BUSINESS_SUPPORT_USER_2 = MOCK_TFM_USERS.find(
  (user) => user.teams.includes(TFM_USER_TEAMS.BUSINESS_SUPPORT) && user.username === 'BUSINESS_SUPPORT_USER_2',
);

const T1_USER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.TEAM1) && user.username === 'T1_USER_1');

const RISK_MANAGER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.RISK_MANAGERS) && user.username === 'RISK_MANAGER_1');

const UNDERWRITING_SUPPORT_1 = MOCK_TFM_USERS.find(
  (user) => user.teams.includes(TFM_USER_TEAMS.UNDERWRITING_SUPPORT) && user.username === 'UNDERWRITING_SUPPORT_1',
);

const PIM_USER_1 = MOCK_TFM_USERS.find((user) => user.teams.includes(TFM_USER_TEAMS.PIM) && user.username === 'PIM_USER_1');

module.exports = {
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

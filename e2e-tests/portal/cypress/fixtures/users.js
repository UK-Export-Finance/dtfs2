const MOCK_USERS = require('../../../../utils/mock-data-loader/portal/users');
const MOCK_TFM_USERS = require('../../../../utils/mock-data-loader/tfm/mocks/users');

const BANK1_MAKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const BANK1_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK2_MAKER2');

const BANK1_CHECKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('checker')) && user.username === 'BANK1_CHECKER1');

const ADMIN = MOCK_USERS.find((user) =>
  user.username === 'ADMIN');

const UKEF_OPERATIONS = MOCK_USERS.find((user) =>
  user.username === 'UKEF_OPERATIONS');

const EDITOR = MOCK_USERS.find((user) =>
  user.username === 'EDITOR');

// TFM 
const UNDERWRITER_MANAGER = MOCK_TFM_USERS.find((user) =>
  user.teams.includes('UNDERWRITER_MANAGERS'));

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  BANK1_CHECKER1,
  ADMIN,
  UKEF_OPERATIONS,
  EDITOR,
  UNDERWRITER_MANAGER,
};

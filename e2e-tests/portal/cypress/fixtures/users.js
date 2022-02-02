const MOCK_USERS = require('../../../../utils/mock-data-loader/portal/users');

const BANK1_MAKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const BANK1_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK2_MAKER2');

cosnt BANK1_CHECKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('checker')) && user.username === 'BANK1_CHECKER1');

const ADMIN = MOCK_USERS.find((user) =>
  user.username === 'ADMIN');

cosnt UKEF_OPERATIONS = MOCK_USERS.find((user) =>
  user.username === 'UKEF_OPERATIONS');

cosnt EDITOR = MOCK_USERS.find((user) =>
  user.username === 'EDITOR');

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  BANK1_CHECKER1,
  ADMIN,
  UKEF_OPERATIONS,
  EDITOR,
};

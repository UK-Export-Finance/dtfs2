const MOCK_USERS = require('./mockUsers');

const BANK1_MAKER1 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

const BANK1_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK1_MAKER2');

const BANK2_MAKER2 = MOCK_USERS.find((user) =>
  (user.roles.includes('maker')) && user.username === 'BANK2_MAKER2');

const ADMIN = MOCK_USERS.find((user) =>
  user.username === 'ADMIN');

module.exports = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK2_MAKER2,
  ADMIN,
};

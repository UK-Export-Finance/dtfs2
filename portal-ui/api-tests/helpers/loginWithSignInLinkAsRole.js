const MOCK_BANKS = require('../../test-helpers/mock-banks');

const loginWithSignInLinkAsRole = (role) => () => ({
  success: true,
  token: 'mock 2FA validated token',
  user: {
    roles: [role],
    bank: MOCK_BANKS.bank1,
  },
});

module.exports = loginWithSignInLinkAsRole;

const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const MOCK_BANKS = require('../../test-helpers/mock-banks');

const loginWithSignInLinkAsRole = (role) => () => ({
  success: true,
  token: 'mock 2FA validated token',
  loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  user: {
    _id: 'mock-user',
    email: 'mock-user@example.com',
    roles: [role],
    bank: MOCK_BANKS.bank1,
  },
});

module.exports = loginWithSignInLinkAsRole;

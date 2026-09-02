const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');

const loginWithSignInLinkAsRole = (role) => () => ({
  success: true,
  token: 'mock 2FA validated token',
  loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  user: {
    _id: 'mock-user',
    email: 'mock-user@example.com',
    bank: { id: '9', name: 'Mock bank' },
    roles: [role],
  },
});

module.exports = loginWithSignInLinkAsRole;

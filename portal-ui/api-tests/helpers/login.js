const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');

const login =
  (token = 'mock login token') =>
  () => ({
    success: true,
    token,
    user: {
      email: 'email@example.com',
    },
    loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
  });

module.exports = login;

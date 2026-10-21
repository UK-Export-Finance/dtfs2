const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');

const login =
  (token = 'mock login token') =>
  () => ({
    success: true,
    token,
    user: {
      email: 'email@example.com',
      userId: '61e567d7db41bd65b00bd47a',
      _id: '61e567d7db41bd65b00bd47a',
    },
    loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
  });

module.exports = login;

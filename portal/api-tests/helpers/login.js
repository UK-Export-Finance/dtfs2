const { LOGIN_STATUS } = require('../../server/constants');

const login =
  (token = 'mock login token') =>
  () => ({
    success: true,
    token,
    user: {
      email: 'email@example.com',
    },
    loginStatus: LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
  });

module.exports = login;

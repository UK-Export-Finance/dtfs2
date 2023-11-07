const login = () => () => ({
  success: true,
  token: 'mock login token',
  loginStatus: 'Valid username and password',
});

module.exports = login;

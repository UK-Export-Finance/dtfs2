const login = (token = 'mock login token') => () => ({
  success: true,
  token,
  user: {
    email: 'email@example.com',
  },
  loginStatus: 'Valid username and password',
});

module.exports = login;

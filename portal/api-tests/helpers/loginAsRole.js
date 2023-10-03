const loginAsRole = (role) => () => ({
  success: true,
  token: 'mock token',
  user: { roles: [role] },
});

module.exports = loginAsRole;

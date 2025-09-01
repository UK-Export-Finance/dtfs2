const loginWithSignInLinkAsRole = (role) => () => ({
  success: true,
  token: 'mock 2FA validated token',
  user: { roles: [role] },
});

module.exports = loginWithSignInLinkAsRole;

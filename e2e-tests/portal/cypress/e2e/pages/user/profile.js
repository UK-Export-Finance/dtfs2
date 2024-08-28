const userProfile = {
  changePassword: () => cy.get('[data-cy="profile-change-password-ok"]'),
  email: () => cy.get('[data-cy="user-email"]'),
};

module.exports = userProfile;

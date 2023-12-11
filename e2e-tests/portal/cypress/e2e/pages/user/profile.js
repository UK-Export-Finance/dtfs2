const userProfile = {
  changePassword: () => cy.get('[data-cy="profile-change-password-ok"]'),
  cancel: () => cy.get('[data-cy="profile-change-password-cancel"]'),
  email: () => cy.get('[data-cy="user-email"]'),
};

module.exports = userProfile;

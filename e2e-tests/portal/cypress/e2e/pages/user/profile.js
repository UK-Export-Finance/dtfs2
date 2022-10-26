const userProfile = {
  changePassword: () => cy.get('[data-cy="profile-change-password-ok"]'),
  cancel: () => cy.get('[data-cy="profile-change-password-cancel"]'),
};

module.exports = userProfile;

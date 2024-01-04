const signInLinkExpired = {
  sendNewSignInLinkButton: () => cy.get('[data-cy="request-new-sign-in-link"]'),
  sendNewSignInLink: () => signInLinkExpired.sendNewSignInLinkButton().click(),
};

module.exports = signInLinkExpired;

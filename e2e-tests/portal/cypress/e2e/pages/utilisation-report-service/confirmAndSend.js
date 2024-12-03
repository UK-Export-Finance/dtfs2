const page = {
  changeLink: () => cy.get('[data-cy="change-link"]'),
  confirmAndSendButton: () => cy.get('[data-cy="confirm-and-send-button"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;

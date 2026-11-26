const page = {
  changeLink: () => cy.get('[data-cy="change-link"]'),
  confirmAndSendButton: (options) => cy.get('[data-cy="confirm-and-send-button"]', options),
  currentUrl: () => cy.url(),
};

module.exports = page;

const page = {
  mainHeading: () => cy.get('[data-cy="confirm-and-send-main-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  changeLink: () => cy.get('[data-cy="change-link"]'),
  confirmAndSendButton: () => cy.get('[data-cy="confirm-and-send-button"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;

const manualApprovalNeeded = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  emailLink: () => cy.get('[data-cy="form-email-link"]'),
  returnLink: () => cy.get('[data-cy="return-link"]'),
};

module.exports = manualApprovalNeeded;

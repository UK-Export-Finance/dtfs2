const manualApprovalNeeded = {
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  emailLink: () => cy.get('[data-cy="form-email-link"]'),
};

module.exports = manualApprovalNeeded;

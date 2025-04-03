const approvedByUkef = {
  approvedByUkefPanel: () => cy.get('[data-cy="approved-by-ukef-confirmation-panel"]'),
  amendmentReference: () => cy.get('[data-cy="amendment-reference"]'),
  confirmationEmail: () => cy.get('[data-cy="confirmation-email"]'),

  approvedAmendmentsEffectiveDate: () => cy.get('[data-cy="approved-amendments-effective-date"]'),
};

module.exports = approvedByUkef;

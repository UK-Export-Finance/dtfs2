const amendmentLeadUnderwriterPage = {
  heading: () => cy.get('[data-cy="amendment-assign-lead-underwriter-heading"]'),

  // form
  assignedToSelectInput: () => cy.get('[data-cy="assigned-to-select-input"]').first(),
  assignedToSelectInputOption: () => cy.get('[data-cy="assigned-to-select-input"] option'),
  assignedToSelectInputSelectedOption: () => cy.get('[data-cy="assigned-to-select-input"]').first().find('option:selected'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = amendmentLeadUnderwriterPage;

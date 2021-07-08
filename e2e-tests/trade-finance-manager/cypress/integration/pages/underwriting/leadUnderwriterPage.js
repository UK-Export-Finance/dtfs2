const leadUnderwriterPage = {
  // link to form
  assignLeadUnderwriterLink: () => cy.get('[data-cy="assign-lead-underwriter-link"]'),

  // form
  assignedToSelectInput: () => cy.get('[data-cy="assigned-to-select-input"]').first(),
  assignedToSelectInputOption: () => cy.get('[data-cy="assigned-to-select-input"] option'),
  assignedToSelectInputSelectedOption: () => cy.get('[data-cy="assigned-to-select-input"]').first().find('option:selected'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),

  // submitted values
  leadUnderwriterName: () => cy.get('[data-cy="lead-underwriter-name"]'),
  leadUnderwriterEmail: () => cy.get('[data-cy="lead-underwriter-email"]'),
  changeLeadUnderwriterLink: () => cy.get('[data-cy="change-lead-underwriter-link"]'),
};

module.exports = leadUnderwriterPage;

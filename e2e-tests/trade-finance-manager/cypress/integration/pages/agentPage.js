const agentPage = {
  heading: () => cy.get('[data-cy="edit-heading"]'),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
  agentUniqueRef: () => cy.get('[data-cy="agent-unique-ref"]'),
  agentUniqueRefInput: () => cy.get('[data-cy="agent-unique-ref-input"]'),
  agentCommissionRate: () => cy.get('[data-cy="agent-commission-rate"]'),
  agentCommissionRateInput: () => cy.get('[data-cy="agent-commission-rate-input"]'),
};

module.exports = agentPage;

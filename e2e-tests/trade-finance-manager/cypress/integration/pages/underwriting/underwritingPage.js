const underwritingPage = {
  dealHeading: () => cy.get('[data-cy="underwriting-heading-deal"]'),

  showAllButton: () => cy.get('[class=govuk-accordion__show-all]'),

  underwritingAccordion: () => cy.get('[data-cy="underwriting"]'),

  assignLeadUnderwriterButton: () => cy.get('[data-cy="assign-lead-underwriter-link"]'),
  leadUnderwriterUnassigned: () => cy.get('[data-cy="unassigned-underwriter-readonly"]'),
  changeLeadUnderwriterLink: () => cy.get('[data-cy="change-lead-underwriter-link"]'),

  addCreditRatingButton: () => cy.get('[data-cy="add-credit-rating-link"]'),
  exporterTableChangeCreditRatingLink: () => cy.get('[data-cy="exporter-table-change-credit-rating-link"]'),
  exporterTableChangeLossGivenDefaultLink: () => cy.get('[data-cy="exporter-table-change-loss-given-default-link"]'),
  exporterTableChangeProbabilityOfDefaultLink: () => cy.get('[data-cy="exporter-table-change-probability-of-default-link"]'),
  facilityTable: (facilityId) => {
    cy.get(`[data-cy="facility-${facilityId}-pricing-risk-table"]`).as('table');
    return {
      facilityLink: () => cy.get('@table').get(`[data-cy="facility-${facilityId}-ukef-facility-id-link"]`),
      riskProfile: () => cy.get('@table').get(`[data-cy="facility-${facilityId}-risk-profile-value"]`),
      changeRiskProfileLink: () => cy.get('@table').get(`[data-cy="facility-${facilityId}-change-risk-profile-link"]`),
    };
  },

  addUnderwriterManagerDecisionButton: () => cy.get('[data-cy="add-decision-link"]'),
  underwriterManagerDecisionNotAdded: () => cy.get('[data-cy="decision-not-added-readonly"]'),

};

module.exports = underwritingPage;

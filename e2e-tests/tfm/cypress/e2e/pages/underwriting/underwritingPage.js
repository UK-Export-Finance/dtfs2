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
  underwriterManagerDecisionNotApplicable: () => cy.get('[data-cy="decision-not-applicable"]'),
  amendmentHeading: () => cy.get('[data-cy="underwriting-heading-amendment"]'),

  assignAmendmentLeadUnderwriterButton: () => cy.get('[data-cy="amendment-assign-lead-underwriter-link"]'),
  amendmentLeadUnderwriterUnassigned: () => cy.get('[data-cy="amendment-unassigned-underwriter-readonly"]'),
  amendmentLeadUnderwriterEmail: () => cy.get('[data-cy="amendment--lead-underwriter-email"]'),
  amendmentChangeLeadUnderwriterLink: () => cy.get('[data-cy="amendment--change-lead-underwriter-link"]'),

  addAmendmentUnderwriterManagerDecisionButton: () => cy.get('[data-cy="amendment-manager-add-decision-link"]'),
  amendmentUnderwriterManagerDecisionNotAdded: () => cy.get('[data-cy="amendment-manager-decision-not-added-readonly"]'),
  amendmentUnderwriterDecisionStatusTag: () => cy.get('[data-cy="decision-status-tag"]'),
  amendmentUnderwriterDecisionMadeBy: () => cy.get('[data-cy="decision-made-by-value"]'),
  amendmentUnderwriterDecisionDateTime: () => cy.get('[data-cy="date-time-value"]'),
  amendmentUnderwriterconditions: () => cy.get('[data-cy="conditions-value"]'),
  amendmentUnderwriterinternalComments: () => cy.get('[data-cy="internal-comments-value"]'),

  addBankDecisionLink: () => cy.get('[data-cy="add-amendment-bank-decision-link"]'),
  bankDecisionDependent: () => cy.get('[data-cy="amendment-bank-decision-dependent"]'),
  bankDecisionUnassigned: () => cy.get('[data-cy="amendment-manager-decision-not-added-readonly"]'),
};

module.exports = underwritingPage;

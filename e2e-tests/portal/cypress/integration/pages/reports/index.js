const page = {
  allUnissuedFacilities: () => cy.get('[data-cy="reports--all-unissued-facilities"]'),
  pastDeadlineUnissuedFacilities: () => cy.get('[data-cy="past-deadline-unissued-facilities"]'),
  facilitiesThatNeedIssuing: () => cy.get('[data-cy="reports--facilities-that-need-issuing"]'),
  reviewAllUnissuedFacilities: () => cy.get('[data-cy="reports--review-unissued-facilities"]'),
  reportsUnissuedFacilitiesBreadcrumbs: () => cy.get('[data-cy="reports--unissued-facilities-breadcrumbs"]'),
  reportsUnissuedFacilitiesMainHeading: () => cy.get('[data-cy="reports--unissued-facilities-mainHeading"]'),
  reportsUnissuedFacilitiesDownload: () => cy.get('[data-cy="reports--unissued-facilities-download"]'),
  reportsUnissuedFacilitiesTable: () => cy.get('[data-cy="reports--unissued-facilities-table"]'),

  reportsReviewUkefDecisionTitle: () => cy.get('[data-cy="reports--review-ukef-decision-title"]'),
  reportsUkefDecisionTable: () => cy.get('[data-cy="reports--ukef-decision-table"]'),

  reportsUnconditionalDecisionBreadcrumbs: () => cy.get('[data-cy="reports--unconditional-decision-breadcrumbs"]'),
  reportsUnconditionalDecisionDownload: () => cy.get('[data-cy="reports--unconditional-decision-download"]'),
  reportsUnconditionalDecision: () => cy.get('[data-cy="reports--unconditional-decision"]'),

  reportsConditionalDecisionBreadcrumbs: () => cy.get('[data-cy="reports--conditional-decision-breadcrumbs"]'),
  reportsConditionalDecisionDownload: () => cy.get('[data-cy="reports--conditional-decision-download"]'),
  reportsConditionalDecision: () => cy.get('[data-cy="reports--conditional-decision"]'),
};

module.exports = page;

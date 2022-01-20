const page = {
  allUnissuedFacilities: () => cy.get('[data-cy="reports--all-unissued-facilities"]'),
  pastDeadlineUnissuedFacilities: () => cy.get('[data-cy="past-deadline-unissued-facilities"]'),
  facilitiesThatNeedIssuing: () => cy.get('[data-cy="reports--facilities-that-need-issuing"]'),
  reviewAllUnissuedFacilities: () => cy.get('[data-cy="reports--review-unissued-facilities"]'),
  reportsUnissuedFacilitiesBreadcrumbs: () => cy.get('[data-cy="reports--unissued-facilities-breadcrumbs"]'),
  reportsUnissuedFacilitiesMainHeading: () => cy.get('[data-cy="reports--unissued-facilities-mainHeading"]'),
  reportsUnissuedFacilitiesDownload: () => cy.get('[data-cy="reports--unissued-facilities-download"]'),
  reportsUnissuedFacilitiesTable: () => cy.get('[data-cy="reports--unissued-facilities-table"]'),
};

module.exports = page;

const facilitiesPage = {
  tfmFacilitiesTable: () => cy.get('[data-cy="tfm-facilities-table"]'),
  ukefFacilityIdColumn: () => cy.get('[data-cy="facility__header--ukefFacilityId"]'),
  productColumn: () => cy.get('[data-cy="facility__header--product"]'),
  dataTypeColumn: () => cy.get('[data-cy="facility__header--dataType"]'),
  exporterColumn: () => cy.get('[data-cy="facility__header--exporter"]'),
  valueColumn: () => cy.get('[data-cy="facility__header--value"]'),
  coverEndDateColumn: () => cy.get('[data-cy="facility__header--coverEndDate"]'),
  facilityStageColumn: () => cy.get('[data-cy="facility__header--facilityStage"]'),
  searchFormInput: () => cy.get('[data-cy="search-input"]'),
  searchFormSubmitButton: () => cy.get('[data-cy="submit-button"]'),
  dealsTableRows: () => cy.get('[data-cy="tfm-facilities-table"] tbody tr'),
};

module.exports = facilitiesPage;

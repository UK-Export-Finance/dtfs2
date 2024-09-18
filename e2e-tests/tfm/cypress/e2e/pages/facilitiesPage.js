const facilitiesPage = {
  heading: () => cy.get('[data-cy="facilities-heading"]'),
  searchFormInput: () => cy.get('[data-cy="search-input"]'),
  facilitiesTableRows: () => cy.get('[data-cy="facilities-table"] tbody tr'),
  facilityIdCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(0),
  dealTypeCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(1),
  typeCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(2),
  companyNameCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(3),
  valueCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(4),
  coverEndDateCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(5),
  facilityStageCell: (rowNumber) => cy.get('[data-cy="facilities-table"] tbody tr').eq(rowNumber).children('td').eq(6),
  facilitiesTable: {
    headings: {
      ukefFacilityId: () => cy.get('[data-cy="facilities-table-heading-ukefFacilityId"]'),
      ukefFacilityIdSortButton: () => cy.get('[data-cy="facilities-table-heading-ukefFacilityId-button"]'),
      dealType: () => cy.get('[data-cy="facilities-table-heading-dealType"]'),
      dealTypeSortButton: () => cy.get('[data-cy="facilities-table-heading-dealType-button"]'),
      type: () => cy.get('[data-cy="facilities-table-heading-type"]'),
      typeSortButton: () => cy.get('[data-cy="facilities-table-heading-type-button"]'),
      companyName: () => cy.get('[data-cy="facilities-table-heading-companyName"]'),
      companyNameSortButton: () => cy.get('[data-cy="facilities-table-heading-companyName-button"]'),
      value: () => cy.get('[data-cy="facilities-table-heading-value"]'),
      valueSortButton: () => cy.get('[data-cy="facilities-table-heading-value-button"]'),
      coverEndDate: () => cy.get('[data-cy="facilities-table-heading-coverEndDate"]'),
      coverEndDateSortButton: () => cy.get('[data-cy="facilities-table-heading-coverEndDate-button"]'),
      facilityStage: () => cy.get('[data-cy="facilities-table-heading-facilityStage"]'),
      facilityStageSortButton: () => cy.get('[data-cy="facilities-table-heading-facilityStage-button"]'),
    },
    row: (facilityId) => {
      cy.get(`[data-cy="facility-${facilityId}"]`).as('row');
      return {
        facilityLink: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-ukefFacilityId-link"]`),
        facilityLinkText: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-ukefFacilityId-link-text"]`),
        dealType: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-dealType"]`),
        type: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-type"]`),
        companyName: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-companyName"]`),
        value: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-value"]`),
        bank: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-bank"]`),
        coverEndDate: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-coverEndDate"]`),
        facilityStage: () => cy.get('@row').get(`[data-cy="facility-${facilityId}-facilityStage"]`),
      };
    },
  },
  pagination: {
    next: () => cy.get('[data-cy="Next"]'),
    last: () => cy.get('[data-cy="Last"]'),
    previous: () => cy.get('[data-cy="Previous"]'),
    first: () => cy.get('[data-cy="First"]'),
    page: (number) => cy.get(`[data-cy="Page_${number}"]`),
  },
};

module.exports = facilitiesPage;

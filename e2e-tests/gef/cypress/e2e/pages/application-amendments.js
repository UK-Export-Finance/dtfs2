const applicationAmendments = {
  subNavigationBarAmendments: () => cy.get('[data-cy="application-amendments-link"]'),
  tabHeading: () => cy.get('[data-cy="tab-heading"]'),
  summaryList: () => cy.get('[data-cy="submitted-amendment-summary-list"]'),
  amendmentDetailsLink: () => cy.get('[data-cy="amendment-details-link"]'),
  amendmentDetails: {
    row: (index) => {
      cy.get(`[data-cy="amendment--details-${index}"]`).as('row');
      return {
        facilityId: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-facility-id"]`),
        facilityType: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-facility-type"]`),
        status: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-status"]`),
        newCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-new-cover-end-date"]`),
        newFacilityEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-new-facility-end-date"]`),
        newFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-new-facility-value"]`),
        effectiveFrom: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-effective-from"]`),
        createdBy: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-created-by"]`),
      };
    },
  },
};

module.exports = applicationAmendments;

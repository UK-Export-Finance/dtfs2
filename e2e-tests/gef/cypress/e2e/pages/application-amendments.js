const applicationAmendments = {
  subNavigationBarAmendments: () => cy.get('[data-cy="application-amendments-link"]'),
  tabHeading: () => cy.get('[data-cy="tab-heading"]'),
  summaryList: () => cy.get('[data-cy="submitted-amendment-summary-list"]'),
};

module.exports = applicationAmendments;

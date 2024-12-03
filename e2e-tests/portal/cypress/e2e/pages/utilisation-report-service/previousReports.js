const page = {
  bodyText: () => cy.get('[data-cy="paragraph"]'),
  sideNavigationItemByYear: (year) => cy.get(`[data-cy="side-navigation-${year}"]`),
  sideNavigationItems: () => cy.get('[data-cy^="side-navigation-"]'),
  listItemLinkByMonth: (month) => cy.get(`[data-cy="list-item-link-${month}"]`),
  currentUrl: () => cy.url(),
};

module.exports = page;

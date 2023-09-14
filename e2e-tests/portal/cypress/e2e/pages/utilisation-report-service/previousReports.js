const page = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  bodyText: () => cy.get('[data-cy="paragraph"]'),
  sideNavigation2022Item: () => cy.get('[data-cy="side-navigation-2022"]'),
  sideNavigation2021Item: () => cy.get('[data-cy="side-navigation-2021"]'),
  listItemLinkNovember: () => cy.get('[data-cy="list-item-link-November"]'),
  listItemLinkDecember: () => cy.get('[data-cy="list-item-link-December"]'),
  currentUrl: () => cy.url(),
};

module.exports = page;

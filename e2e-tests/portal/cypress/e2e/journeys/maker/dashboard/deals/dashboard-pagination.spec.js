const { dashboardDeals } = require('../../../../pages');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { MOCK_DEALS } = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const { BSS_DEAL } = MOCK_DEALS;

context('Dashboard deals pagination', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    const twentyOneDeals = Array.from(Array(21), () => BSS_DEAL);

    cy.insertManyDeals(twentyOneDeals, BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
  });

  it('should render a nav element', () => {
    dashboardDeals.paginationNav().should('exist');
  });

  it('should render 20 results per page, total number of items and working First/Previous/Next/Last links', () => {
    // test amount of rows
    dashboardDeals.rows().should('have.length', 20);

    // test pagination
    cy.assertText(dashboardDeals.totalItems(), '(21 items)');

    dashboardDeals.first().should('not.exist');
    dashboardDeals.previous().should('not.exist');
    dashboardDeals.next().should('exist');
    dashboardDeals.last().should('exist');

    // go to the next/last page
    dashboardDeals.next().click();

    // test amount of rows
    dashboardDeals.rows().should('have.length', 1);

    // test pagination
    cy.assertText(dashboardDeals.totalItems(), '(21 items)');

    dashboardDeals.first().should('exist');
    dashboardDeals.previous().should('exist');
    dashboardDeals.next().should('not.exist');
    dashboardDeals.last().should('not.exist');
  });
});

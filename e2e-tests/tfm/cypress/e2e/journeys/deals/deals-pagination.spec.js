import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1 } from '../../../../../e2e-fixtures';

context('User can navigate through a paginated table of deals using the pagination navigation', () => {
  const numberOfDeals = 62;

  before(() => {
    cy.deleteAllTfmDealsFromDb();
    cy.insertManyTfmDealsIntoDb(numberOfDeals);
  });

  beforeEach(() => {
    cy.login(T1_USER_1);

    cy.url().should('eq', relative('/deals/0'));
    cy.checkDealIdCells({ firstDealId: '10000001', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  after(() => {
    cy.deleteAllTfmDealsFromDb();
  });

  it('should allow the user to navigate to the next page of the deals table', () => {
    pages.dealsPage.pagination.next().click();

    cy.url().should('eq', relative('/deals/1'));
    cy.checkDealIdCells({ firstDealId: '10000021', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to the last page of the deals table', () => {
    pages.dealsPage.pagination.last().click();

    cy.url().should('eq', relative('/deals/3'));
    cy.checkDealIdCells({ firstDealId: '10000061', increment: 1, numberToCheck: 2 });
    cy.checkDealsTableRowsTotal(2);
  });

  it('should allow the user to navigate to the previous page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.previous().click();

    cy.url().should('eq', relative('/deals/2'));
    cy.checkDealIdCells({ firstDealId: '10000041', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to the first page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.first().click();

    cy.url().should('eq', relative('/deals/0'));
    cy.checkDealIdCells({ firstDealId: '10000001', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to a specific page of the deals table', () => {
    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2'));
    cy.checkDealIdCells({ firstDealId: '10000041', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated deals table when sorting is active', () => {
    // click once for `ascending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();
    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    cy.checkDealIdCells({ firstDealId: '10000062', increment: -1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);

    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2?sortfield=dealSnapshot.ukefDealId&sortorder=descending'));
    cy.checkDealIdCells({ firstDealId: '10000022', increment: -1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated deals table when filtering/search is active', () => {
    const searchString = 'Company 1';
    const expectedNumberOfMatches = Math.ceil(numberOfDeals / 2);
    cy.keyboardInput(pages.dealsPage.searchFormInput(), searchString);
    cy.clickSubmitButton();

    cy.url().should('eq', relative('/deals/0?search=Company%201'));

    cy.assertText(pages.dealsPage.heading(), `${expectedNumberOfMatches} results for "${searchString}"`);

    cy.checkDealIdCells({ firstDealId: '10000001', increment: 2, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);

    pages.dealsPage.pagination.next().click();

    cy.assertText(pages.dealsPage.heading(), `${expectedNumberOfMatches} results for "${searchString}"`);

    cy.checkDealIdCells({ firstDealId: '10000041', increment: 2, numberToCheck: 10 });
    cy.checkDealsTableRowsTotal(11);
  });

  it('should redirect to the first page of the deals table when the user sorts the table', () => {
    cy.visit('/deals/2');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    cy.url().should('eq', relative('/deals/0?sortfield=dealSnapshot.ukefDealId&sortorder=ascending'));
    cy.checkDealIdCells({ firstDealId: '10000001', increment: 1, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should redirect to the first page of the deals table when the user searches', () => {
    cy.visit('/deals/2');
    const searchString = 'Company 1';
    cy.keyboardInput(pages.dealsPage.searchFormInput(), searchString);
    cy.clickSubmitButton();

    cy.url().should('eq', relative('/deals/0?search=Company%201'));
    cy.checkDealIdCells({ firstDealId: '10000001', increment: 2, numberToCheck: 20 });
    cy.checkDealsTableRowsTotal(20);
  });
});

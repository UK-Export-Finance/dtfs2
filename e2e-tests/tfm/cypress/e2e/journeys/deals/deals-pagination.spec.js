import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1 } from '../../../../../e2e-fixtures';

context('User can navigate through a paginated table of deals using the pagination navigation', () => {
  const numberOfDeals = 62;

  before(() => {
    cy.deleteAllTfmDealsFromDb();
    cy.deleteAllTfmDealsFromDb();
    cy.insertManyTfmDealsIntoDb(numberOfDeals);
  });

  beforeEach(() => {
    cy.login(T1_USER_1);

    cy.url().should('eq', relative('/deals/0'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000001' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000020' });
    cy.checkDealsTableRowsTotal(20);
  });

  after(() => {
    cy.deleteAllTfmDealsFromDb();
  });

  it('should allow the user to navigate to the next page of the deals table', () => {
    pages.dealsPage.pagination.next().click();

    cy.url().should('eq', relative('/deals/1'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000021' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000040' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to the last page of the deals table', () => {
    pages.dealsPage.pagination.last().click();

    cy.url().should('eq', relative('/deals/3'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000061' });
    cy.checkDealIdCell({ rowNumber: 1, expectedDealId: '10000062' });
    cy.checkDealsTableRowsTotal(2);
  });

  it('should allow the user to navigate to the previous page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.previous().click();

    cy.url().should('eq', relative('/deals/2'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000041' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000060' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to the first page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.first().click();

    cy.url().should('eq', relative('/deals/0'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000001' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000020' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate to a specific page of the deals table', () => {
    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000041' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000060' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated deals table when sorting is active', () => {
    // click once for `ascending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();
    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000062' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000043' });
    cy.checkDealsTableRowsTotal(20);

    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2?sortfield=dealSnapshot.ukefDealId&sortorder=descending'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000022' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000003' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated deals table when filtering/search is active', () => {
    const searchString = 'Company 1';
    const expectedNumberOfMatches = Math.ceil(numberOfDeals / 2);
    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    cy.url().should('eq', relative('/deals/0?search=Company%201'));
    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedNumberOfMatches} results for "${searchString}"`);
    });
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000001' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000039' });
    cy.checkDealsTableRowsTotal(20);

    pages.dealsPage.pagination.next().click();

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedNumberOfMatches} results for "${searchString}"`);
    });
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000041' });
    cy.checkDealIdCell({ rowNumber: 10, expectedDealId: '10000061' });
    cy.checkDealsTableRowsTotal(11);
  });

  it('should redirect to the first page of the deals table when the user sorts the table', () => {
    cy.visit('/deals/2');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    cy.url().should('eq', relative('/deals/0?sortfield=dealSnapshot.ukefDealId&sortorder=ascending'));
    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000001' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000020' });
    cy.checkDealsTableRowsTotal(20);
  });

  it('should redirect to the first page of the deals table when the user searches', () => {
    cy.visit('/deals/2');
    const searchString = 'Company 1';
    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    cy.url().should('eq', relative('/deals/0?search=Company%201'));

    cy.checkDealIdCell({ rowNumber: 0, expectedDealId: '10000001' });
    cy.checkDealIdCell({ rowNumber: 19, expectedDealId: '10000039' });
    cy.checkDealsTableRowsTotal(20);
  });
});

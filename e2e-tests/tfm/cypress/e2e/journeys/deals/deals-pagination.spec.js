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
    pages.dealsPage.dealsTableRows().eq(0).contains('10000001');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000020');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
  });

  after(() => {
    // cy.deleteAllTfmDealsFromDb();
  });

  it('should allow the user to navigate to the next page of the deals table', () => {
    pages.dealsPage.pagination.next().click();

    cy.url().should('eq', relative('/deals/1'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000021');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000040');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
  });

  it('should allow the user to navigate to the last page of the deals table', () => {
    pages.dealsPage.pagination.last().click();

    cy.url().should('eq', relative('/deals/3'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000061');
    pages.dealsPage.dealsTableRows().eq(1).contains('10000062');
    pages.dealsPage.dealsTableRows().should('have.length', 2);
  });

  it('should allow the user to navigate to the previous page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.previous().click();

    cy.url().should('eq', relative('/deals/2'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000041');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000060');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
  });

  it('should allow the user to navigate to the first page of the deals table', () => {
    cy.visit('/deals/3');
    pages.dealsPage.pagination.first().click();

    cy.url().should('eq', relative('/deals/0'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000001');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000020');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
  });

  it('should allow the user to navigate to a specific page of the deals table', () => {
    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000041');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000060');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
  });

  it('should allow the user to navigate through the paginated deals table when sorting is active', () => {
    // click once for `ascending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();
    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    pages.dealsPage.dealsTableRows().eq(0).contains('10000062');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000043');
    pages.dealsPage.dealsTableRows().should('have.length', 20);

    pages.dealsPage.pagination.page(2).click();

    cy.url().should('eq', relative('/deals/2?sortfield=dealSnapshot.ukefDealId&sortorder=descending'));
    pages.dealsPage.dealsTableRows().eq(0).contains('10000022');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000003');
    pages.dealsPage.dealsTableRows().should('have.length', 20);
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
    pages.dealsPage.dealsTableRows().eq(0).contains('10000001');
    pages.dealsPage.dealsTableRows().eq(19).contains('10000039');
    pages.dealsPage.dealsTableRows().should('have.length', 20);

    pages.dealsPage.pagination.next().click();

    pages.dealsPage.heading().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${expectedNumberOfMatches} results for "${searchString}"`);
    });
    pages.dealsPage.dealsTableRows().eq(0).contains('10000041');
    pages.dealsPage.dealsTableRows().eq(10).contains('10000061');
    pages.dealsPage.dealsTableRows().should('have.length', 11);
  });

  it('should redirect to the first page of the deals table when the user sorts the table', () => {
    cy.visit('/deals/2');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    cy.url().should('eq', relative('/deals/0?sortfield=dealSnapshot.ukefDealId&sortorder=ascending'));
  });

  it('should redirect to the first page of the deals table when the user searches', () => {
    cy.visit('/deals/2');
    const searchString = 'Company 1';
    pages.dealsPage.searchFormInput().type(searchString);
    pages.dealsPage.searchFormSubmitButton().click();

    cy.url().should('eq', relative('/deals/0?search=Company%201'));
  });
});

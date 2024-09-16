import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1 } from '../../../../../e2e-fixtures';

context('User can navigate through a paginated table of facilities using the pagination navigation', () => {
  const numberOfFacilities = 62;

  before(() => {
    cy.deleteAllTfmDealsFromDb();
    cy.deleteAllTfmFacilitiesFromDb();
    cy.insertManyTfmFacilitiesAndTwoLinkedDealsIntoDb(numberOfFacilities);
  });

  beforeEach(() => {
    cy.login({ user: T1_USER_1 });
    cy.visit('/facilities');

    cy.url().should('eq', relative('/facilities/0'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000001', increment: 1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  after(() => {
    cy.deleteAllTfmDealsFromDb();
    cy.deleteAllTfmFacilitiesFromDb();
  });

  it('should allow the user to navigate to the next page of the facilities table', () => {
    pages.facilitiesPage.pagination.next().click();

    cy.url().should('eq', relative('/facilities/1'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000021', increment: 1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should allow the user to navigate to the last page of the facilities table', () => {
    pages.facilitiesPage.pagination.last().click();

    cy.url().should('eq', relative('/facilities/3'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000061', increment: 1, numberToCheck: 2 });
    cy.checkFacilitiesTableRowsTotal(2);
  });

  it('should allow the user to navigate to the previous page of the facilities table', () => {
    cy.visit('/facilities/3');
    pages.facilitiesPage.pagination.previous().click();

    cy.url().should('eq', relative('/facilities/2'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000041', increment: 1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should allow the user to navigate to the first page of the facilities table', () => {
    cy.visit('/facilities/3');
    pages.facilitiesPage.pagination.first().click();

    cy.url().should('eq', relative('/facilities/0'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000001', increment: 1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should allow the user to navigate to a specific page of the facilities table', () => {
    pages.facilitiesPage.pagination.page(2).click();

    cy.url().should('eq', relative('/facilities/2'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000041', increment: 1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated facilities table when sorting is active', () => {
    // default for facilities table is ukefFacilityId `ascending` so click once for `descending` order
    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityIdSortButton().click();

    cy.checkFacilityIdCells({ firstFacilityId: '10000062', increment: -1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);

    pages.facilitiesPage.pagination.page(2).click();

    cy.url().should('eq', relative('/facilities/2?sortfield=ukefFacilityId&sortorder=descending'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000022', increment: -1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should allow the user to navigate through the paginated facilities table when filtering/search is active', () => {
    const searchString = 'Company 1';
    const expectedNumberOfMatches = Math.ceil(numberOfFacilities / 2);
    pages.facilitiesPage.searchFormInput().type(searchString);
    pages.facilitiesPage.searchFormSubmitButton().click();

    cy.url().should('eq', relative('/facilities/0?search=Company%201'));
    pages.facilitiesPage
      .heading()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal(`${expectedNumberOfMatches} results for "${searchString}"`);
      });
    cy.checkFacilityIdCells({ firstFacilityId: '10000001', increment: 2, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);

    pages.facilitiesPage.pagination.next().click();

    pages.facilitiesPage
      .heading()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.equal(`${expectedNumberOfMatches} results for "${searchString}"`);
      });
    cy.checkFacilityIdCells({ firstFacilityId: '10000041', increment: 2, numberToCheck: 10 });
    cy.checkFacilitiesTableRowsTotal(11);
  });

  it('should redirect to the first page of the facilities table when the user sorts the table', () => {
    cy.visit('/facilities/2');
    pages.facilitiesPage.facilitiesTable.headings.ukefFacilityIdSortButton().click();

    cy.url().should('eq', relative('/facilities/0?sortfield=ukefFacilityId&sortorder=descending'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000062', increment: -1, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });

  it('should redirect to the first page of the facilities table when the user searches', () => {
    cy.visit('/facilities/2');
    const searchString = 'Company 1';
    pages.facilitiesPage.searchFormInput().type(searchString);
    pages.facilitiesPage.searchFormSubmitButton().click();

    cy.url().should('eq', relative('/facilities/0?search=Company%201'));
    cy.checkFacilityIdCells({ firstFacilityId: '10000001', increment: 2, numberToCheck: 20 });
    cy.checkFacilitiesTableRowsTotal(20);
  });
});

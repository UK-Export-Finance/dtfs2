import relative from '../../relativeURL';
import pages from '../../pages';
import DATE_CONSTANTS from '../../../../../e2e-fixtures/dateConstants';
import createMockDeal from '../../../fixtures/create-mock-deal';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals by ukefDealId', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = [];
  let ALL_FACILITIES = [];
  let dealAscending1;
  let dealAscending2;
  let dealDescending1;
  let dealDescending2;

  const { twoDaysAgo, yesterday } = DATE_CONSTANTS;

  const DEAL_1 = createMockDeal({
    submissionDate: twoDaysAgo.valueOf().toString(),
  });

  const DEAL_2 = createMockDeal({
    submissionDate: yesterday.valueOf().toString(),
  });

  const MOCK_DEALS = [DEAL_1, DEAL_2];

  before(() => {
    cy.deleteTfmDeals();

    cy.insertManyDeals(MOCK_DEALS, BANK1_MAKER1).then((insertedDeals) => {
      insertedDeals.forEach((deal) => {
        const { _id: dealId, mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((facilities) => {
          ALL_FACILITIES = [...ALL_FACILITIES, ...facilities];
        });
      });

      cy.submitManyDeals(insertedDeals, T1_USER_1);
      cy.get(aliasSelector(ALIAS_KEY.SUBMIT_MANY_DEALS)).then((submittedDeals) => {
        ALL_SUBMITTED_DEALS = submittedDeals;

        ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = ALL_SUBMITTED_DEALS.sort((a, b) => {
          const dealAUkefId = a.dealSnapshot.details.ukefDealId;
          const dealBUkefId = b.dealSnapshot.details.ukefDealId;

          return Number(dealAUkefId) - Number(dealBUkefId);
        });

        [dealAscending1, dealAscending2] = ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER;

        dealDescending1 = dealAscending2;
        dealDescending2 = dealAscending1;
      });
    });
  });

  beforeEach(() => {
    cy.login({ user: T1_USER_1 });
    cy.url().should('eq', relative('/deals/0'));
  });

  after(() => {
    ALL_FACILITIES.forEach(({ _id }) => {
      cy.deleteFacility(_id, BANK1_MAKER1);
    });
    cy.deleteTfmDeals();
  });

  it('should have correct default button name `ascending` and table header aria-sort of `none`', () => {
    pages.dealsPage.dealsTable.headings.ukefDealId().invoke('attr', 'aria-sort').should('eq', 'none');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealAscending1._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealAscending2._id}`);

    pages.dealsPage.dealsTable.headings.ukefDealId().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can sort by descending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealDescending1._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealDescending2._id}`);

    pages.dealsPage.dealsTable.headings.ukefDealId().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

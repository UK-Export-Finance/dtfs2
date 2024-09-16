import relative from '../../relativeURL';
import pages from '../../pages';
import DATE_CONSTANTS from '../../../../../e2e-fixtures/dateConstants';
import createMockDeal from '../../../fixtures/create-mock-deal';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealMostRecent;
  let dealNotRecent;

  const { twoDaysAgo, yesterday } = DATE_CONSTANTS;

  const DEAL_NOT_RECENT = createMockDeal({
    details: {
      ukefDealId: 1,
      submissionDate: twoDaysAgo.valueOf().toString(),
    },
  });

  const DEAL_MOST_RECENT = createMockDeal({
    details: {
      ukefDealId: 2,
      submissionDate: yesterday.valueOf().toString(),
    },
  });

  const MOCK_DEALS = [DEAL_NOT_RECENT, DEAL_MOST_RECENT];

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

        dealMostRecent = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.details.submissionDate === DEAL_MOST_RECENT.details.submissionDate);

        dealNotRecent = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.details.submissionDate === DEAL_NOT_RECENT.details.submissionDate);
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

  it('should not be sorted by default and ordered by most recent date received/submissionDate', () => {
    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealMostRecent._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealNotRecent._id}`);
  });

  it('should have correct default button name and table header aria-sort of `descending`', () => {
    pages.dealsPage.dealsTable.headings.dateReceived().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can change sort by to ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealNotRecent._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealMostRecent._id}`);

    pages.dealsPage.dealsTable.headings.dateReceived().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can change `sort by` back to default ascending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealMostRecent._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealNotRecent._id}`);

    pages.dealsPage.dealsTable.headings.dateReceived().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.dateReceivedSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

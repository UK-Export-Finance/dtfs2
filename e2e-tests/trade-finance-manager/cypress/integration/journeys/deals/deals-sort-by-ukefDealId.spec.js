import moment from 'moment';
import relative from '../../relativeURL';
import pages from '../../pages';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and sort deals by ukefDealId', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = [];
  let ALL_SUBMITTED_DEALS_SORTED_IN_DESCENDING_ORDER = [];
  let ALL_FACILITIES = [];

  const twoDaysAgo = moment().subtract(2, 'day');
  const yesterday = moment().subtract(1, 'day');
  const today = moment();

  const DEAL_1 = createMockDeal({
    details: {
      submissionDate: moment(twoDaysAgo).utc().valueOf().toString(),
    },
  });

  const DEAL_2 = createMockDeal({
    details: {
      submissionDate: moment(yesterday).utc().valueOf().toString(),
    },
  });

  const DEAL_3 = createMockDeal({
    details: {
      submissionDate: moment(today).utc().valueOf().toString(),
    },
  });

  const MOCK_DEALS = [
    DEAL_3,
    DEAL_2,
    DEAL_1,
  ];

  before(() => {
    cy.deleteTfmDeals();

    cy.insertManyDeals(MOCK_DEALS, MOCK_MAKER_TFM)
      .then((insertedDeals) => {
        insertedDeals.forEach((deal) => {
          const {
            _id: dealId,
            mockFacilities,
          } = deal;

          cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((facilities) => {
            ALL_FACILITIES = [
              ...ALL_FACILITIES,
              ...facilities,
            ];
          });
        });

        cy.submitManyDeals(insertedDeals).then((submittedDeals) => {
          ALL_SUBMITTED_DEALS = submittedDeals;

          ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = Array.from(ALL_SUBMITTED_DEALS);
          ALL_SUBMITTED_DEALS_SORTED_IN_DESCENDING_ORDER = Array.from(ALL_SUBMITTED_DEALS).reverse();
        });
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.url().should('eq', relative('/deals'));
  });

  after(() => {
    ALL_FACILITIES.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
    cy.deleteTfmDeals();
  });

  it('should have correct default button name and table header aria-sort of `ascending`', () => {
    pages.dealsPage.dealsTable.headings.ukefDealId().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER[0]._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER[1]._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER[2]._id}`);

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
    row1.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_DESCENDING_ORDER[0]._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_DESCENDING_ORDER[1]._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${ALL_SUBMITTED_DEALS_SORTED_IN_DESCENDING_ORDER[2]._id}`);

    pages.dealsPage.dealsTable.headings.ukefDealId().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.ukefDealIdSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

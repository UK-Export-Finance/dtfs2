import moment from 'moment';
import relative from '../../relativeURL';
import pages from '../../pages';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and sort deals by ukefDealId', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = [];
  let ALL_FACILITIES = [];
  let dealAscending1;
  let dealAscending2;
  let dealDescending1;
  let dealDescending2;

  const twoDaysAgo = moment().subtract(2, 'day');
  const yesterday = moment().subtract(1, 'day');

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

  const MOCK_DEALS = [
    DEAL_1,
    DEAL_2,
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

          ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER = ALL_SUBMITTED_DEALS.sort((a, b) => {
            const dealAUkefId = a.dealSnapshot.details.ukefDealId;
            const dealBUkefId = b.dealSnapshot.details.ukefDealId;

            return (Number(dealAUkefId) - Number(dealBUkefId));
          });


          dealAscending1 = ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER[0];
          dealAscending2 = ALL_SUBMITTED_DEALS_SORTED_IN_ASCENDING_ORDER[1];

          dealDescending1 = dealAscending2;
          dealDescending2 = dealAscending1;
        });
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.url().should('eq', relative('/deals'));
  });

  after(() => {
    ALL_FACILITIES.forEach(({ _id }) => {
      cy.deleteFacility(_id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
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

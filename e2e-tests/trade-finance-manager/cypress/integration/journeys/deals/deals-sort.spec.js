import moment from 'moment';
import relative from '../../relativeURL';
import pages from '../../pages';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and sort deals', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealMostRecent;
  let dealNotRecent;

  const twoDaysAgo = moment().subtract(2, 'day');
  const yesterday = moment().subtract(1, 'day');

  const DEAL_NOT_RECENT = createMockDeal({
    details: {
      ukefDealId: 1,
      submissionDate: moment(twoDaysAgo).utc().valueOf().toString(),
    },
  });

  const DEAL_MOST_RECENT = createMockDeal({
    details: {
      ukefDealId: 2,
      submissionDate: moment(yesterday).utc().valueOf().toString(),
    },
  });

  const MOCK_DEALS = [
    DEAL_NOT_RECENT,
    DEAL_MOST_RECENT,
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

          dealMostRecent = ALL_SUBMITTED_DEALS.find((deal) =>
            deal.dealSnapshot.details.submissionDate === DEAL_MOST_RECENT.details.submissionDate);

          dealNotRecent = ALL_SUBMITTED_DEALS.find((deal) =>
            deal.dealSnapshot.details.submissionDate === DEAL_NOT_RECENT.details.submissionDate);
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

  it('should not be sorted by default and ordered by most recent date received/submissionDate', () => {
    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealMostRecent._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealNotRecent._id}`);
  });
});

import { DEAL_MOST_RECENT_VARS, DEAL_NOT_RECENT_VARS } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals', () => {
  const ALL_SUBMITTED_DEALS = [];
  const ALL_FACILITIES = [];
  let dealMostRecent;
  let dealNotRecent;

  before(() => {
    cy.deleteTfmDeals();

    cy.loadData('deals-sort-by-received-date');

    cy.listAllDeals(BANK1_MAKER1).then((deals) => {
      // reverse array to ensure most recent deal is first
      deals.reverse();

      deals.forEach((deal) => {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

        cy.submitManyDeals([deal], T1_USER_1);

        cy.get(aliasSelector(ALIAS_KEY.SUBMIT_MANY_DEALS)).then((submittedDeals) => {
          ALL_SUBMITTED_DEALS.push(submittedDeals[0]);

          if (!dealMostRecent) {
            dealMostRecent = ALL_SUBMITTED_DEALS.find(
              (submittedDeal) => submittedDeal.dealSnapshot.details.submissionDate === DEAL_MOST_RECENT_VARS.details.submissionDate,
            );
          }

          if (!dealNotRecent) {
            dealNotRecent = ALL_SUBMITTED_DEALS.find(
              (submittedDeal) => submittedDeal.dealSnapshot.details.submissionDate === DEAL_NOT_RECENT_VARS.details.submissionDate,
            );
          }
        });
      });
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
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

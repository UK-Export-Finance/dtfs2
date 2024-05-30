import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import createMockDeal from '../../../fixtures/create-mock-deal';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals by stage', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealConfirmed;
  let dealApplication;

  const DEAL_CONFIRMED = createMockDeal({
    testId: 'DEAL_CONFIRMED',
    mockFacilities: MOCK_DEAL_AIN.mockFacilities,
  });

  const DEAL_APPLICATION = createMockDeal({
    submissionType: 'Manual Inclusion Application',
    testId: 'DEAL_APPLICATION',
    mockFacilities: MOCK_DEAL_AIN.mockFacilities,
  });

  const MOCK_DEALS = [DEAL_CONFIRMED, DEAL_APPLICATION];

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

        dealConfirmed = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.testId === DEAL_CONFIRMED.testId);

        dealApplication = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.testId === DEAL_APPLICATION.testId);
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

  it('should have correct default button name `ascending` and table header aria-sort of `none`', () => {
    pages.dealsPage.dealsTable.headings.stage().invoke('attr', 'aria-sort').should('eq', 'none');
    pages.dealsPage.dealsTable.headings.stageSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.stageSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealApplication._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealConfirmed._id}`);

    pages.dealsPage.dealsTable.headings.stage().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.stageSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can sort by descending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.stageSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.stageSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealConfirmed._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealApplication._id}`);

    pages.dealsPage.dealsTable.headings.stage().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.stageSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

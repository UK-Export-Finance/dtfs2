import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals by exporter', () => {
  let ALL_SUBMITTED_DEALS = [];
  const ALL_FACILITIES = [];
  let dealAscending1;
  let dealAscending2;
  let dealDescending1;
  let dealDescending2;

  before(() => {
    cy.deleteTfmDeals();

    cy.loadData('deals-sort-by-exporter');

    cy.listAllDeals(BANK1_MAKER1).then((deals) => {
      cy.submitManyDeals(deals, T1_USER_1);

      cy.get(aliasSelector(ALIAS_KEY.SUBMIT_MANY_DEALS)).then((submittedDeals) => {
        // sort by ascending order
        ALL_SUBMITTED_DEALS = submittedDeals.sort((a, b) => {
          const dealASupplier = a.dealSnapshot.submissionDetails['supplier-name'];
          const dealBSupplier = b.dealSnapshot.submissionDetails['supplier-name'];

          return dealASupplier.localeCompare(dealBSupplier);
        });

        [dealAscending1, dealAscending2] = ALL_SUBMITTED_DEALS;

        dealDescending1 = dealAscending2;
        dealDescending2 = dealAscending1;

        submittedDeals.forEach((deal) => {
          const { dealSnapshot } = deal;
          if (dealSnapshot.facilities && dealSnapshot.facilities.length) {
            ALL_FACILITIES.push(...dealSnapshot.facilities);
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

  it('should have correct default button name `ascending` and table header aria-sort of `none`', () => {
    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'none');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealAscending1._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealAscending2._id}`);

    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can sort by descending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealDescending1._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealDescending2._id}`);

    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

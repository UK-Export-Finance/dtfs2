import {
  DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS,
  DEAL_WITH_1_LOAN_AND_BOND_FACILITIES_VARS,
  DEAL_WITH_ONLY_1_FACILITY_BOND_VARS,
} from '@ukef/dtfs2-common/test-helpers';
import relative from '../../relativeURL';
import pages from '../../pages';
import { T1_USER_1, BANK1_MAKER1 } from '../../../../../e2e-fixtures';
import { ALIAS_KEY } from '../../../fixtures/constants';
import { aliasSelector } from '../../../../../support/alias-selector';

context('User can view and sort deals by product', () => {
  let ALL_SUBMITTED_DEALS = [];
  const ALL_FACILITIES = [];
  let dealWith1FacilityBond;
  let dealWith1FacilityLoan;
  let dealWith1LoanAndBondFacilities;

  before(() => {
    cy.deleteTfmDeals();

    cy.loadData('deals-sort-by-product');

    cy.listAllDeals(BANK1_MAKER1).then((deals) => {
      cy.submitManyDeals(deals, T1_USER_1);

      cy.get(aliasSelector(ALIAS_KEY.SUBMIT_MANY_DEALS)).then((submittedDeals) => {
        ALL_SUBMITTED_DEALS = submittedDeals;

        dealWith1FacilityBond = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.testId === DEAL_WITH_ONLY_1_FACILITY_BOND_VARS.testId);
        dealWith1FacilityLoan = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.testId === DEAL_WITH_ONLY_1_FACILITY_LOAN_VARS.testId);
        dealWith1LoanAndBondFacilities = ALL_SUBMITTED_DEALS.find((deal) => deal.dealSnapshot.testId === DEAL_WITH_1_LOAN_AND_BOND_FACILITIES_VARS.testId);

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
    pages.dealsPage.dealsTable.headings.product().invoke('attr', 'aria-sort').should('eq', 'none');
    pages.dealsPage.dealsTable.headings.productSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.productSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1FacilityBond._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1LoanAndBondFacilities._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1FacilityLoan._id}`);

    pages.dealsPage.dealsTable.headings.product().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.productSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can sort by descending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.productSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.productSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1FacilityLoan._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1LoanAndBondFacilities._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${dealWith1FacilityBond._id}`);

    pages.dealsPage.dealsTable.headings.product().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.productSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

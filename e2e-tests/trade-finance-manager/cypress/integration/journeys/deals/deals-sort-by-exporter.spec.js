import relative from '../../relativeURL';
import pages from '../../pages';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and sort deals by exporter', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealAscending1;
  let dealAscending2;
  let dealDescending1;
  let dealDescending2;

  // Exporter (called supplier-name in a BSS deal), is generated automatically with mock data and deal ID.
  const DEAL_A_SUPPLIER = createMockDeal({
    testId: 'DEAL_A_SUPPLIER',
  });

  const DEAL_B_SUPPLIER = createMockDeal({
    testId: 'DEAL_B_SUPPLIER',
  });

  const MOCK_DEALS = [
    DEAL_A_SUPPLIER,
    DEAL_B_SUPPLIER,
  ];

  before(() => {
    cy.deleteTfmDeals();

    cy.insertManyDeals(MOCK_DEALS, MOCK_MAKER_TFM).then((insertedDeals) => {
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
        // sort by ascending order
        ALL_SUBMITTED_DEALS = submittedDeals.sort((a, b) => {
          const dealASupplier = a.dealSnapshot.submissionDetails['supplier-name'];
          const dealBSupplier = b.dealSnapshot.submissionDetails['supplier-name'];

          return dealASupplier.localeCompare(dealBSupplier);
        });

        [dealAscending1, dealAscending2] = ALL_SUBMITTED_DEALS;

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
      cy.deleteFacility(_id, MOCK_MAKER_TFM);
    });
    cy.deleteTfmDeals();
  });

  it('should have correct default button name and table header aria-sort of `ascending`', () => {
    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'ascending');
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

import relative from '../../relativeURL';
import pages from '../../pages';
import createMockDeal from '../../../fixtures/create-mock-deal';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';

context('User can view and sort deals by exporter', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealSupplier1;
  let dealSupplier2;
  let dealSupplier3;

  const DEAL_A_SUPPLIER = createMockDeal({
    details: {
      testId: 'DEAL_A_SUPPLIER',
    },
    submissionDetails: {
      'supplier-name': 'A_SUPPLIER',
    },
  });

  const DEAL_B_SUPPLIER = createMockDeal({
    details: {
      testId: 'DEAL_B_SUPPLIER',
    },
    submissionDetails: {
      'supplier-name': 'B_SUPPLIER',
    },
  });

  const DEAL_C_SUPPLIER = createMockDeal({
    details: {
      testId: 'DEAL_C_SUPPLIER',
    },
    submissionDetails: {
      'supplier-name': 'C_SUPPLIER',
    },
  });


  const MOCK_DEALS = [
    DEAL_A_SUPPLIER,
    DEAL_B_SUPPLIER,
    DEAL_C_SUPPLIER,
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

          dealSupplier1 = ALL_SUBMITTED_DEALS.find((deal) =>
            deal.dealSnapshot.details.testId === DEAL_A_SUPPLIER.details.testId);

          dealSupplier2 = ALL_SUBMITTED_DEALS.find((deal) =>
            deal.dealSnapshot.details.testId === DEAL_B_SUPPLIER.details.testId);

          dealSupplier3 = ALL_SUBMITTED_DEALS.find((deal) =>
            deal.dealSnapshot.details.testId === DEAL_C_SUPPLIER.details.testId);
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
    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });

  it('can sort by ascending order. Sort button and table header aria-sort should have updated values', () => {
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    // check first row
    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier1._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier2._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier3._id}`);

    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'ascending');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'descending');
  });

  it('can sort by descending order. Sort button and table header aria-sort should have updated values', () => {
    // click `ascending` order
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    // click again for `descending` order
    pages.dealsPage.dealsTable.headings.exporterSortButton().click();

    pages.dealsPage.dealsTableRows().should('have.length', ALL_SUBMITTED_DEALS.length);

    const row1 = pages.dealsPage.dealsTableRows().eq(0);
    row1.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier3._id}`);

    // check second row
    const row2 = pages.dealsPage.dealsTableRows().eq(1);
    row2.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier2._id}`);

    // check third row
    const row3 = pages.dealsPage.dealsTableRows().eq(2);
    row3.invoke('attr', 'data-cy').should('eq', `deal-${dealSupplier1._id}`);

    pages.dealsPage.dealsTable.headings.exporter().invoke('attr', 'aria-sort').should('eq', 'descending');
    pages.dealsPage.dealsTable.headings.exporterSortButton().invoke('attr', 'name').should('eq', 'ascending');
  });
});

import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import createMockDeal from '../../../fixtures/create-mock-deal';
import { T1_USER_1 } from '../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM } from '../../../fixtures/users-portal';
import CONSTANTS from '../../../fixtures/constants';

context('User can view and sort deals by product', () => {
  let ALL_SUBMITTED_DEALS = [];
  let ALL_FACILITIES = [];
  let dealWith1FacilityBond;
  let dealWith1FacilityLoan;
  let dealWith1LoanAndBondFacilities;

  const DEAL_WITH_ONLY_1_FACILITY_BOND = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_BOND',
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === CONSTANTS.FACILITY_TYPE.BOND),
    ],
  });

  const DEAL_WITH_ONLY_1_FACILITY_LOAN = createMockDeal({
    testId: 'DEAL_WITH_ONLY_1_FACILITY_LOAN',
    mockFacilities: [
      MOCK_DEAL_AIN.mockFacilities.find((f) => f.type === CONSTANTS.FACILITY_TYPE.LOAN),
    ],
  });

  const DEAL_WITH_1_LOAN_AND_BOND_FACILITIES = createMockDeal({
    testId: 'DEAL_WITH_1_LOAN_AND_BOND_FACILITIES',
    mockFacilities: MOCK_DEAL_AIN.mockFacilities,
  });

  const MOCK_DEALS = [
    DEAL_WITH_ONLY_1_FACILITY_BOND,
    DEAL_WITH_ONLY_1_FACILITY_LOAN,
    DEAL_WITH_1_LOAN_AND_BOND_FACILITIES,
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
        ALL_SUBMITTED_DEALS = submittedDeals;

        dealWith1FacilityBond = ALL_SUBMITTED_DEALS.find((deal) =>
          deal.dealSnapshot.testId === DEAL_WITH_ONLY_1_FACILITY_BOND.testId);

        dealWith1FacilityLoan = ALL_SUBMITTED_DEALS.find((deal) =>
          deal.dealSnapshot.testId === DEAL_WITH_ONLY_1_FACILITY_LOAN.testId);

        dealWith1LoanAndBondFacilities = ALL_SUBMITTED_DEALS.find((deal) =>
          deal.dealSnapshot.testId === DEAL_WITH_1_LOAN_AND_BOND_FACILITIES.testId);
      });
    });
  });

  beforeEach(() => {
    cy.login(T1_USER_1);
    cy.url().should('eq', relative('/deals'));
  });

  after(() => {
    ALL_FACILITIES.forEach(({ _id }) => {
      cy.deleteFacility(_id, MOCK_MAKER_TFM);
    });
    cy.deleteTfmDeals();
  });

  it('should have correct default button name and table header aria-sort of `ascending`', () => {
    pages.dealsPage.dealsTable.headings.product().invoke('attr', 'aria-sort').should('eq', 'ascending');
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

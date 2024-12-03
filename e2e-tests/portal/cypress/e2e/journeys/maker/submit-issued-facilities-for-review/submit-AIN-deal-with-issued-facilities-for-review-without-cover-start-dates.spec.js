const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const {
  fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate,
  ISSUED_BOND_DATE_VALUE,
} = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate,
} = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Maker fills in bond & loan issue facility forms without requested cover start date and submits the deal for checker review', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };
  const today = ISSUED_BOND_DATE_VALUE.toLocaleDateString('en-GB');

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('defaults the submitted facilities requested cover start dates to the previously entered issue date', () => {
    let bondRow;
    let loanRow;

    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('not.exist');

    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.issueFacilityLink().click();

      fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate();
      cy.url().should('eq', relative(`/contract/${dealId}`));
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.issueFacilityLink().click();

      fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate();
      cy.url().should('eq', relative(`/contract/${dealId}`));
    });

    // Submit deal for review
    cy.clickProceedToReviewButton();

    cy.keyboardInput(pages.contractReadyForReview.comments(), 'Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // Expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // Expect bond requested cover start date to default to issued date
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.requestedCoverStartDate(), today);
    });

    // Expect loan requested cover start date to default to issued date
    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.requestedCoverStartDate(), today);
    });
  });
});

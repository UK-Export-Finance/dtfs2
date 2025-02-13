const pages = require('../../pages');
const relative = require('../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast = require('./fixtures/MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { sevenDaysAgo } = require('../../../../../e2e-fixtures/dateConstants');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast;

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

  it('When a maker clicks `confirm start date` on Issued & Unconditional facilities, enters an invalid date, the date should not be saved', () => {
    cy.login(BANK1_MAKER1);

    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Issued' && b.status === 'Submitted');

    const issuedSubmittedBondId = issuedSubmittedBond._id;
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id;
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    const INVALID_DATE = sevenDaysAgo.date;

    //---------------------------------------------------------------
    // Issued Bond - enter and submit an invalid date in 'Confirm start date' form
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();

    cy.completeDateFormFields({ idPrefix: 'requestedCoverStartDate', date: INVALID_DATE });
    cy.clickSubmitButton();

    pages.facilityConfirmCoverStartDate.coverStarDateErrorMessage().should('be.visible');

    //---------------------------------------------------------------
    // go back to the deal page
    //---------------------------------------------------------------
    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Unconditional Loan - enter and submit an invalid date in 'Confirm start date' form
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();

    cy.completeDateFormFields({ idPrefix: 'requestedCoverStartDate', date: INVALID_DATE });

    cy.clickSubmitButton();

    pages.facilityConfirmCoverStartDate.coverStarDateErrorMessage().should('be.visible');

    //---------------------------------------------------------------
    // go back to the deal page
    //---------------------------------------------------------------
    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // facility tables should display original dates
    // the date submitted in 'Confirm start date' form should not be displayed
    //---------------------------------------------------------------
    const originalBondCoverStartDate = new Date(parseInt(issuedSubmittedBond.requestedCoverStartDate, 10));

    cy.assertText(issuedSubmittedBondRow.requestedCoverStartDate(), originalBondCoverStartDate.toLocaleDateString('en-GB'));

    const originalLoanCoverStartDate = new Date(parseInt(unconditionalSubmittedLoan.requestedCoverStartDate, 10));

    cy.assertText(unconditionalSubmittedLoanRow.requestedCoverStartDate(), originalLoanCoverStartDate.toLocaleDateString('en-GB'));

    //---------------------------------------------------------------
    // facility tables should display 'Confirm start date',
    // not 'Start date confirmed'
    //---------------------------------------------------------------
    cy.assertText(issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink(), 'Confirm start date');

    cy.assertText(unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink(), 'Confirm start date');
  });
});

const pages = require('../../../pages');
const relative = require('../../../relativeURL');

const MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast = require('./fixtures/MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');
const mockUsers = require('../../../../fixtures/mockUsers');
const { nowPlusDays } = require('../../../../support/utils/dateFuncs');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'Bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });
  });

  it('When a maker clicks `confirm start date` on Issued & Unconditional facilities, enters an invalid date, the date should not be saved', () => {
    cy.login({ ...MAKER_LOGIN });

    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted');

    const issuedSubmittedBondId = issuedSubmittedBond._id;
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id;
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    const INVALID_DATE = nowPlusDays(-7);

    //---------------------------------------------------------------
    // Issued Bond - enter and submit an invalid date in 'Confirm start date' form
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();

    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(INVALID_DATE.getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(INVALID_DATE.getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(INVALID_DATE.getFullYear());
    pages.facilityConfirmCoverStartDate.submit().click();

    pages.facilityConfirmCoverStartDate.coverStarDateErrorMessage().should('be.visible');

    //---------------------------------------------------------------
    // go back to the deal page
    //---------------------------------------------------------------
    pages.facilityConfirmCoverStartDate.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Unconditional Loan - enter and submit an invalid date in 'Confirm start date' form
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();

    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(INVALID_DATE.getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(INVALID_DATE.getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(INVALID_DATE.getFullYear());
    pages.facilityConfirmCoverStartDate.submit().click();

    pages.facilityConfirmCoverStartDate.coverStarDateErrorMessage().should('be.visible');

    //---------------------------------------------------------------
    // go back to the deal page
    //---------------------------------------------------------------
    pages.facilityConfirmCoverStartDate.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // facility tables should display original dates
    // the date submitted in 'Confirm start date' form should not be displayed
    //---------------------------------------------------------------
    const originalBondCoverStartDate = new Date(parseInt(issuedSubmittedBond.requestedCoverStartDate, 10));

    issuedSubmittedBondRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).equal(originalBondCoverStartDate.toLocaleDateString('en-GB'));
    });

    const originalLoanCoverStartDate = new Date(parseInt(unconditionalSubmittedLoan.requestedCoverStartDate, 10));

    unconditionalSubmittedLoanRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).equal(originalLoanCoverStartDate.toLocaleDateString('en-GB'));
    });

    //---------------------------------------------------------------
    // facility tables should display 'Confirm start date',
    // not 'Start date confirmed'
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().invoke('text').then((text) => {
      expect(text.trim()).equal('Confirm start date');
    });

    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().invoke('text').then((text) => {
      expect(text.trim()).equal('Confirm start date');
    });
  });
});

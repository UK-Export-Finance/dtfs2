const moment = require('moment');
const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const { formattedTimestamp } = require('../../../../../deal-api/src/v1/facility-dates/timestamp');

const MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast = require('./MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('When a maker clicks `confirm start date` on Issued & Unconditional facilities, enters an invalid date, the date should not be saved', () => {
    cy.login({ ...MAKER_LOGIN });

    pages.contract.visit(deal);

    const issuedSubmittedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Issued' && b.status === 'Submitted');

    const issuedSubmittedBondId = issuedSubmittedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const unconditionalSubmittedLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    const INVALID_DATE = moment().subtract(1, 'week');

    //---------------------------------------------------------------
    // Issued Bond - enter and submit an invalid date in 'Confirm start date' form
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(INVALID_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(INVALID_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(INVALID_DATE.format('YYYY'));
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
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(INVALID_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(INVALID_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(INVALID_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();

    pages.facilityConfirmCoverStartDate.coverStarDateErrorMessage().should('be.visible');

    //---------------------------------------------------------------
    // go back to the deal page
    //---------------------------------------------------------------
    pages.facilityConfirmCoverStartDate.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // original dates should be displayed
    // the date submitted in 'Confirm start date' form should not be displayed
    //---------------------------------------------------------------
    const originalBondCoverStartDate = formattedTimestamp(issuedSubmittedBond.requestedCoverStartDate);

    issuedSubmittedBondRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).equal(moment(originalBondCoverStartDate).format('DD/MM/YYYY'));
    });

    const originalLoanCoverStartDate = formattedTimestamp(unconditionalSubmittedLoan.requestedCoverStartDate);

    unconditionalSubmittedLoanRow.requestedCoverStartDate().invoke('text').then((text) => {
      expect(text.trim()).equal(moment(originalLoanCoverStartDate).format('DD/MM/YYYY'));
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

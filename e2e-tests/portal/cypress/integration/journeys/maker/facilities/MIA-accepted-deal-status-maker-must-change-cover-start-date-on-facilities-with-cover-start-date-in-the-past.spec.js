const moment = require('moment');
const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast = require('./fixtures/MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');

const mockUsers = require('../../../../fixtures/mockUsers');
const { formattedTimestamp } = require('../../../../../../../portal-api/src/v1/facility-dates/timestamp');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

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

        const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilitiesCoverStartDateInPast;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('Maker can `Confirm or change start date` for Issued & Unconditional facilities and only resubmit the deal once all Issued & Unconditional facilities have had their start date confirmed', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted');

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const issuedSubmittedBondId = issuedSubmittedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    //---------------------------------------------------------------
    // Maker must change Cover start date for Bond facility when existing cover start date is in the past
    //---------------------------------------------------------------
    const dealSubmissionDate = formattedTimestamp(deal.details.submissionDate);

    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedSubmittedBondId}/confirm-requested-cover-start-date`));

    const NEW_BOND_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'week');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // Maker must change Cover start date for Loan facility when existing cover start date is in the past
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalSubmittedLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'month');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // `confirm start date` link/text should be updated
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');


    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been changed/confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/0'));
  });
});

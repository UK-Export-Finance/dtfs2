const moment = require('moment');
const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilities = require('./MIA-deal-with-accepted-status-issued-facilities');
const mockUsers = require('../../../../fixtures/mockUsers');
const { formattedTimestamp } = require('../../../../../deal-api/src/v1/facility-dates/timestamp');

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
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Maker Can `Confirm or change start date` for Issued & Unconditional facilities and resubmit the deal', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const issuedSubmittedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Issued' && b.status === 'Submitted');

    const issuedCompletedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Issued' && b.status !== 'Submitted'); // `Completed` is generated dynamically

    const unissuedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Unissued');

    const unconditionalSubmittedLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalCompletedLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Unconditional' && l.status !== 'Submitted'); // `Completed` is generated dynamically

    const conditionalLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Conditional');

    const issuedSubmittedBondId = issuedSubmittedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const issuedCompletedBondId = issuedCompletedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedCompletedBondRow = pages.contract.bondTransactionsTable.row(issuedCompletedBondId);


    const unissuedBondId = unissuedBond._id; // eslint-disable-line no-underscore-dangle
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    const unconditionalCompletedLoanId = unconditionalCompletedLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalCompletedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalCompletedLoanId);

    const conditionalLoanId = conditionalLoan._id; // eslint-disable-line no-underscore-dangle
    const conditionalLoanRow = pages.contract.loansTransactionsTable.row(conditionalLoanId);


    //---------------------------------------------------------------
    // `Confirm start date` link should appear for Issued Bonds & Unconditional Loans
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    issuedSubmittedBondRow.issueFacilityLink().should('not.be.visible');

    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    unconditionalSubmittedLoanRow.issueFacilityLink().should('not.be.visible');

    //---------------------------------------------------------------
    // `Issue facility` link should appear for Unissued Bonds & Conditional Loans
    //---------------------------------------------------------------
    unissuedBondRow.issueFacilityLink().should('be.visible');
    unissuedBondRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

    conditionalLoanRow.issueFacilityLink().should('be.visible');
    conditionalLoanRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Issued facility with 'Submitted' status
    //---------------------------------------------------------------
    const dealSubmissionDate = formattedTimestamp(deal.details.submissionDate);

    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedSubmittedBondId}/confirm-requested-cover-start-date`));

    const NEW_BOND_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'week');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Issued facility with 'Compeleted' status
    //---------------------------------------------------------------
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedCompletedBondId}/confirm-requested-cover-start-date`));

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Unconditional facility with 'Submitted' status
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalSubmittedLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'month');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker cannot resubmit deal until all facility cover start dates have been confirmed
    // at this point, only 1 facility has NOT had the date confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('be.disabled');

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Unconditional facility with 'Completed' status
    //---------------------------------------------------------------
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalCompletedLoanId}/confirm-requested-cover-start-date`));
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // - Cover start date changes are rendered in the table
    // - `change start date` link/text updated
    //---------------------------------------------------------------
    const expectedBondDate = moment(NEW_BOND_COVER_START_DATE).format('DD/MM/YYYY');
    issuedSubmittedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');

    issuedCompletedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');


    const expectedLoanDate = moment(NEW_LOAN_COVER_START_DATE).format('DD/MM/YYYY');
    unconditionalSubmittedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');

    unconditionalCompletedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');

    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/0'));
  });
});

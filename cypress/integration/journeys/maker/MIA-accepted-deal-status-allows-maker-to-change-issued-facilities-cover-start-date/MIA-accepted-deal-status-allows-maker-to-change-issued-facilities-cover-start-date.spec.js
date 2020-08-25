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

    const issuedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Issued');

    const unissuedBond = deal.bondTransactions.items.find((b) =>
      b.bondStage === 'Unissued');

    const unconditionalLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Unconditional');

    const conditionalLoan = deal.loanTransactions.items.find((l) =>
      l.facilityStage === 'Conditional');

    const issuedBondId = issuedBond._id; // eslint-disable-line no-underscore-dangle
    const unissuedBondId = unissuedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedBondRow = pages.contract.bondTransactionsTable.row(issuedBondId);
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);


    const unconditionalLoanId = unconditionalLoan._id; // eslint-disable-line no-underscore-dangle
    const conditionalLoanId = conditionalLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalLoanRow = pages.contract.loansTransactionsTable.row(unconditionalLoanId);
    const conditionalLoanRow = pages.contract.loansTransactionsTable.row(conditionalLoanId);

    //---------------------------------------------------------------
    // `Confirm start date` link should appear for Issued & Unconditional facilities
    //---------------------------------------------------------------
    issuedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    issuedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    issuedBondRow.issueFacilityLink().should('not.be.visible');

    unconditionalLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    unconditionalLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    unconditionalLoanRow.issueFacilityLink().should('not.be.visible');

    //---------------------------------------------------------------
    // TODO `Issue facility` link should appear for Unissued & Conditional facilities
    //---------------------------------------------------------------
    unissuedBondRow.issueFacilityLink().should('be.visible');
    unissuedBondRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

    conditionalLoanRow.issueFacilityLink().should('be.visible');
    conditionalLoanRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

    //---------------------------------------------------------------
    // Maker can change Issued facility Cover start date
    //---------------------------------------------------------------
    const dealSubmissionDate = formattedTimestamp(deal.details.submissionDate);

    issuedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedBondId}/confirm-requested-cover-start-date`));

    const NEW_BOND_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'week');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));


    //---------------------------------------------------------------
    // Maker can change Unconditional facility Cover start date
    //---------------------------------------------------------------
    unconditionalLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = moment(dealSubmissionDate).add(1, 'month');

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.format('DD'));
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.format('MM'));
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.format('YYYY'));
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // - Cover start date changes are rendered in the table
    // - `change start date` link/text updated
    //---------------------------------------------------------------
    const expectedIssuedBondDate = moment(NEW_BOND_COVER_START_DATE).format('DD/MM/YYYY');
    issuedBondRow.requestedCoverStartDate().should('contain.text', expectedIssuedBondDate);
    issuedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');

    const expectedUnconditionalLoanDate = moment(NEW_LOAN_COVER_START_DATE).format('DD/MM/YYYY');
    unconditionalLoanRow.requestedCoverStartDate().should('contain.text', expectedUnconditionalLoanDate);
    unconditionalLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date changed');

    //---------------------------------------------------------------
    // Maker can resubmit deal
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/0'));
  });
});

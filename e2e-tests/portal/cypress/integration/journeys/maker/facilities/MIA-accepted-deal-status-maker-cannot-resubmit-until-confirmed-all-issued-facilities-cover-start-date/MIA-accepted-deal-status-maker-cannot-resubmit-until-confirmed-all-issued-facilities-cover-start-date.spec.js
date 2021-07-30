const moment = require('moment');
const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilities = require('./MIA-deal-with-accepted-status-issued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');
const { formattedTimestamp } = require('../../../../../../../../portal-api/src/v1/facility-dates/timestamp');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker')));

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
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilities;

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

  const coverStartDateInputsShouldNotBeVisibile = () => {
    pages.facilityConfirmCoverStartDate.coverStartDateDay().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateYear().should('not.be.visible');
  };

  it('Maker can `Confirm or change start date` for Issued & Unconditional facilities and only resubmit the deal once all Issued & Unconditional facilities have had their start date confirmed', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted');

    const issuedCompletedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status !== 'Submitted'); // `Completed` is generated dynamically

    const unissuedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Unissued');

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalCompletedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status !== 'Submitted'); // `Completed` is generated dynamically

    const conditionalLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Conditional');

    const issuedSubmittedBondId = issuedSubmittedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const secondIssuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted' && b._id !== issuedSubmittedBondId); // eslint-disable-line no-underscore-dangle

    const secondIssuedSubmittedBondId = secondIssuedSubmittedBond._id; // eslint-disable-line no-underscore-dangle
    const secondIssuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(secondIssuedSubmittedBondId);


    const issuedCompletedBondId = issuedCompletedBond._id; // eslint-disable-line no-underscore-dangle
    const issuedCompletedBondRow = pages.contract.bondTransactionsTable.row(issuedCompletedBondId);

    const unissuedBondId = unissuedBond._id; // eslint-disable-line no-underscore-dangle
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id; // eslint-disable-line no-underscore-dangle
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    // secondUnconditionalSubmittedLoanRow
    const secondUnconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted' && l._id !== unconditionalSubmittedLoanId); // eslint-disable-line no-underscore-dangle

    const secondUnconditionalSubmittedLoanId = secondUnconditionalSubmittedLoan._id; // eslint-disable-line no-underscore-dangle
    const secondUnconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(secondUnconditionalSubmittedLoanId);


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
    // Maker can change Cover start date for an Issued facility with 'Completed' status
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
    // Maker selects 'no, do not change date, keep existing date' for a Bond
    // in Confirm start date form
    //---------------------------------------------------------------
    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    coverStartDateInputsShouldNotBeVisibile();

    pages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // Maker selects 'no, do not change date, keep existing date' for a Loan
    // in Confirm start date form
    //---------------------------------------------------------------
    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();

    coverStartDateInputsShouldNotBeVisibile();
    pages.facilityConfirmCoverStartDate.submit().click();

    //---------------------------------------------------------------
    // - Cover start date changes are rendered in the table
    // - `confirm start date` link/text should be updated
    //---------------------------------------------------------------
    const expectedBondDate = moment(NEW_BOND_COVER_START_DATE).format('DD/MM/YYYY');
    issuedSubmittedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    issuedCompletedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    const expectedLoanDate = moment(NEW_LOAN_COVER_START_DATE).format('DD/MM/YYYY');
    unconditionalSubmittedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    unconditionalCompletedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // - Cover start dates that have NOT changed are rendered in the table
    // - `confirm start date` link/text should be updated
    //---------------------------------------------------------------

    secondIssuedSubmittedBondRow.requestedCoverStartDate().should('contain.text',
      moment(issuedSubmittedBond.requestedCoverStartDate).format('DD/MM/YYYY'));

    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    secondUnconditionalSubmittedLoanRow.requestedCoverStartDate().should('contain.text',
      moment(issuedSubmittedBond.requestedCoverStartDate).format('DD/MM/YYYY'));

    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/0'));

    //---------------------------------------------------------------
    // Maker can no longer change cover start dates
    // because the deal is in Ready for Check status
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondRow = pages.contract.bondTransactionsTable.row(bond._id); // eslint-disable-line no-underscore-dangle
      bondRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanRow = pages.contract.loansTransactionsTable.row(loan._id); // eslint-disable-line no-underscore-dangle
      loanRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');
    });

    //---------------------------------------------------------------
    // Checker only sees `Facility issued` link for submitted, issued facilities
    // all other facilities do not display `start date link` or `issue facility` link
    //---------------------------------------------------------------

    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondRow = pages.contract.bondTransactionsTable.row(bond._id); // eslint-disable-line no-underscore-dangle
      bondRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

      issuedSubmittedBondRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });
    });

    dealFacilities.loans.forEach((loan) => {
      const loanRow = pages.contract.loansTransactionsTable.row(loan._id); // eslint-disable-line no-underscore-dangle
      loanRow.changeOrConfirmCoverStartDateLink().should('not.be.visible');

      unconditionalSubmittedLoanRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });
    });
  });
});

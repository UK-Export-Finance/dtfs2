const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilities = require('./MIA-deal-with-accepted-status-issued-facilities');
const MOCK_USERS = require('../../../../../fixtures/users');
const { nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

context('Given a deal that has `Accepted` status with Issued, Unissued, Unconditional and Conditional facilities', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilities, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = MIADealWithAcceptedStatusIssuedFacilities;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  const coverStartDateInputsShouldNotBeVisibile = () => {
    pages.facilityConfirmCoverStartDate.coverStartDateDay().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateYear().should('not.be.visible');
  };

  it('Maker can `Confirm or change start date` for Issued & Unconditional facilities and only resubmit the deal once all Issued & Unconditional facilities have had their start date confirmed', () => {
    cy.login(BANK1_MAKER1);
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

    const issuedSubmittedBondId = issuedSubmittedBond._id;
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const secondIssuedSubmittedBond = dealFacilities.bonds.find((b) =>
      b.facilityStage === 'Issued' && b.status === 'Submitted' && b._id !== issuedSubmittedBondId);

    const secondIssuedSubmittedBondId = secondIssuedSubmittedBond._id;
    const secondIssuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(secondIssuedSubmittedBondId);


    const issuedCompletedBondId = issuedCompletedBond._id;
    const issuedCompletedBondRow = pages.contract.bondTransactionsTable.row(issuedCompletedBondId);

    const unissuedBondId = unissuedBond._id;
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id;
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    // secondUnconditionalSubmittedLoanRow
    const secondUnconditionalSubmittedLoan = dealFacilities.loans.find((l) =>
      l.facilityStage === 'Unconditional' && l.status === 'Submitted' && l._id !== unconditionalSubmittedLoanId);

    const secondUnconditionalSubmittedLoanId = secondUnconditionalSubmittedLoan._id;
    const secondUnconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(
      secondUnconditionalSubmittedLoanId,
    );

    const unconditionalCompletedLoanId = unconditionalCompletedLoan._id;
    const unconditionalCompletedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalCompletedLoanId);

    const conditionalLoanId = conditionalLoan._id;
    const conditionalLoanRow = pages.contract.loansTransactionsTable.row(conditionalLoanId);


    //---------------------------------------------------------------
    // `Confirm start date` link should appear for Issued Bonds & Unconditional Loans
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    issuedSubmittedBondRow.issueFacilityLink().should('not.exist');

    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    unconditionalSubmittedLoanRow.issueFacilityLink().should('not.exist');

    //---------------------------------------------------------------
    // `Issue facility` link should appear for Unissued Bonds & Conditional Loans
    //---------------------------------------------------------------
    unissuedBondRow.issueFacilityLink().should('be.visible');
    unissuedBondRow.changeOrConfirmCoverStartDateLink().should('not.exist');

    conditionalLoanRow.issueFacilityLink().should('be.visible');
    conditionalLoanRow.changeOrConfirmCoverStartDateLink().should('not.exist');

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Issued facility with 'Submitted' status
    //---------------------------------------------------------------
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedSubmittedBondId}/confirm-requested-cover-start-date`));

    const NEW_BOND_COVER_START_DATE = () => {
      const date = new Date(parseInt(deal.details.submissionDate, 10));
      date.setDate(date.getDate() + 7);
      return date;
    };

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE().getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE().getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE().getFullYear());
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
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_BOND_COVER_START_DATE().getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_BOND_COVER_START_DATE().getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_BOND_COVER_START_DATE().getFullYear());
    pages.facilityConfirmCoverStartDate.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Unconditional facility with 'Submitted' status
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalSubmittedLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = nowPlusMonths(1);

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.getFullYear());
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
    pages.facilityConfirmCoverStartDate.coverStartDateDay().type(NEW_LOAN_COVER_START_DATE.getDate());
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().type(NEW_LOAN_COVER_START_DATE.getMonth() + 1);
    pages.facilityConfirmCoverStartDate.coverStartDateYear().type(NEW_LOAN_COVER_START_DATE.getFullYear());
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
    const expectedBondDate = NEW_BOND_COVER_START_DATE().toLocaleDateString('en-GB');
    issuedSubmittedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    issuedCompletedBondRow.requestedCoverStartDate().should('contain.text', expectedBondDate);
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    const expectedLoanDate = NEW_LOAN_COVER_START_DATE.toLocaleDateString('en-GB');
    unconditionalSubmittedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    unconditionalCompletedLoanRow.requestedCoverStartDate().should('contain.text', expectedLoanDate);
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // - Cover start dates that have NOT changed are rendered in the table
    // - `confirm start date` link/text should be updated
    //---------------------------------------------------------------

    secondIssuedSubmittedBondRow.requestedCoverStartDate().should('contain.text',
      new Date(issuedSubmittedBond.requestedCoverStartDate).toLocaleDateString('en-GB'));

    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    secondUnconditionalSubmittedLoanRow.requestedCoverStartDate().should('contain.text',
      new Date(issuedSubmittedBond.requestedCoverStartDate).toLocaleDateString('en-GB'));

    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Updated cover start dates');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    //---------------------------------------------------------------
    // Maker can no longer change cover start dates
    // because the deal is in Ready for Check status
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondRow = pages.contract.bondTransactionsTable.row(bond._id);
      bondRow.changeOrConfirmCoverStartDateLink().should('not.exist');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanRow = pages.contract.loansTransactionsTable.row(loan._id);
      loanRow.changeOrConfirmCoverStartDateLink().should('not.exist');
    });

    //---------------------------------------------------------------
    // Checker only sees `Facility issued` link for submitted, issued facilities
    // all other facilities do not display `start date link` or `issue facility` link
    //---------------------------------------------------------------

    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondRow = pages.contract.bondTransactionsTable.row(bond._id);
      bondRow.changeOrConfirmCoverStartDateLink().should('not.exist');

      issuedSubmittedBondRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });
    });

    dealFacilities.loans.forEach((loan) => {
      const loanRow = pages.contract.loansTransactionsTable.row(loan._id);
      loanRow.changeOrConfirmCoverStartDateLink().should('not.exist');

      unconditionalSubmittedLoanRow.issueFacilityLink().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Facility issued');
      });
    });
  });
});

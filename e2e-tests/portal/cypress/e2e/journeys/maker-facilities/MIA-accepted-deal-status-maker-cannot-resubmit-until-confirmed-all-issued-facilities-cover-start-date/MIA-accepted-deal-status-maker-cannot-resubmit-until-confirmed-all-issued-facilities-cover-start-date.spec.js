const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MIADealWithAcceptedStatusIssuedFacilities = require('./MIA-deal-with-accepted-status-issued-facilities');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const DATE_CONSTANTS = require('../../../../../../e2e-fixtures/dateConstants');

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
    cy.insertOneDeal(MIADealWithAcceptedStatusIssuedFacilities, BANK1_MAKER1).then((insertedDeal) => {
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
    cy.deleteDeals(ADMIN);
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  const coverStartDateInputsShouldNotBeVisible = () => {
    pages.facilityConfirmCoverStartDate.coverStartDateDay().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateMonth().should('not.be.visible');
    pages.facilityConfirmCoverStartDate.coverStartDateYear().should('not.be.visible');
  };

  it('Maker can `Confirm or change start date` for Issued & Unconditional facilities and only resubmit the deal once all Issued & Unconditional facilities have had their start date confirmed', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    const issuedSubmittedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Issued' && b.status === 'Submitted');

    const issuedCompletedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Issued' && b.status !== 'Submitted'); // `Completed` is generated dynamically

    const unissuedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Unissued');

    const unconditionalSubmittedLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Unconditional' && l.status === 'Submitted');

    const unconditionalCompletedLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Unconditional' && l.status !== 'Submitted'); // `Completed` is generated dynamically

    const conditionalLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Conditional');

    const issuedSubmittedBondId = issuedSubmittedBond._id;
    const issuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(issuedSubmittedBondId);

    const secondIssuedSubmittedBond = dealFacilities.bonds.find(
      (b) => b.facilityStage === 'Issued' && b.status === 'Submitted' && b._id !== issuedSubmittedBondId,
    );

    const fourthIssuedSubmittedBond = dealFacilities.bonds.find(
      (b) => b.facilityStage === 'Issued' && b.status === 'Submitted' && b._id !== secondIssuedSubmittedBond,
    );

    const secondIssuedSubmittedBondId = secondIssuedSubmittedBond._id;
    const secondIssuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(secondIssuedSubmittedBondId);

    const fourthIssuedSubmittedBondId = fourthIssuedSubmittedBond._id;
    const fourthIssuedSubmittedBondRow = pages.contract.bondTransactionsTable.row(fourthIssuedSubmittedBondId);

    const issuedCompletedBondId = issuedCompletedBond._id;
    const issuedCompletedBondRow = pages.contract.bondTransactionsTable.row(issuedCompletedBondId);

    const unissuedBondId = unissuedBond._id;
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    const unconditionalSubmittedLoanId = unconditionalSubmittedLoan._id;
    const unconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(unconditionalSubmittedLoanId);

    const secondUnconditionalSubmittedLoan = dealFacilities.loans.find(
      (l) => l.facilityStage === 'Unconditional' && l.status === 'Submitted' && l._id !== unconditionalSubmittedLoanId,
    );

    const secondUnconditionalSubmittedLoanId = secondUnconditionalSubmittedLoan._id;
    const secondUnconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(secondUnconditionalSubmittedLoanId);

    const fourthUnconditionalSubmittedLoan = dealFacilities.loans.find(
      (l) => l.facilityStage === 'Unconditional' && l.status === 'Submitted' && l._id !== secondUnconditionalSubmittedLoanId,
    );

    const fourthUnconditionalSubmittedLoanId = fourthUnconditionalSubmittedLoan._id;
    const fourthUnconditionalSubmittedLoanRow = pages.contract.loansTransactionsTable.row(fourthUnconditionalSubmittedLoanId);

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
      return date;
    };

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateDay(), NEW_BOND_COVER_START_DATE().getDate());

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateMonth(), NEW_BOND_COVER_START_DATE().getMonth() + 1);

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateYear(), NEW_BOND_COVER_START_DATE().getFullYear());

    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Issued facility with 'Completed' status
    //---------------------------------------------------------------
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    issuedCompletedBondRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${issuedCompletedBondId}/confirm-requested-cover-start-date`));

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateDay(), NEW_BOND_COVER_START_DATE().getDate());

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateMonth(), NEW_BOND_COVER_START_DATE().getMonth() + 1);

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateYear(), NEW_BOND_COVER_START_DATE().getFullYear());

    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Unconditional facility with 'Submitted' status
    //---------------------------------------------------------------
    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalSubmittedLoanId}/confirm-requested-cover-start-date`));

    const NEW_LOAN_COVER_START_DATE = DATE_CONSTANTS.oneMonth;

    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateDay(), NEW_LOAN_COVER_START_DATE.getDate());

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateMonth(), NEW_LOAN_COVER_START_DATE.getMonth() + 1);

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateYear(), NEW_LOAN_COVER_START_DATE.getFullYear());

    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Maker cannot resubmit deal until all facility cover start dates have been confirmed
    // at this point, only 1 facility has NOT had the date confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.exist');

    //---------------------------------------------------------------
    // Maker can change Cover start date for an Unconditional facility with 'Completed' status
    //---------------------------------------------------------------
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${unconditionalCompletedLoanId}/confirm-requested-cover-start-date`));
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateYes().click();
    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateDay(), NEW_LOAN_COVER_START_DATE.getDate());

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateMonth(), NEW_LOAN_COVER_START_DATE.getMonth() + 1);

    cy.keyboardInput(pages.facilityConfirmCoverStartDate.coverStartDateYear(), NEW_LOAN_COVER_START_DATE.getFullYear());

    cy.clickSubmitButton();

    //---------------------------------------------------------------
    // Maker selects 'no, do not change date, keep existing date' for a Bond
    // in Confirm start date form
    //---------------------------------------------------------------
    // Second bond
    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();
    coverStartDateInputsShouldNotBeVisible();

    cy.clickSubmitButton();

    /**
     * Maker should still not be able to submit the deal for check,
     * until all the pending issued facilities cover start date has
     * been confirmed.
     */
    pages.contract.proceedToReview().should('not.exist');

    //---------------------------------------------------------------
    // Maker selects 'no, do not change date, keep existing date' for a Loan
    // in Confirm start date form
    //---------------------------------------------------------------
    // Second loan
    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Confirm start date');

    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().click();
    pages.facilityConfirmCoverStartDate.needToChangeCoverStartDateNo().click();

    coverStartDateInputsShouldNotBeVisible();
    cy.clickSubmitButton();

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

    cy.assertText(unconditionalSubmittedLoanRow.requestedCoverStartDate(), expectedLoanDate);

    unconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    cy.assertText(unconditionalCompletedLoanRow.requestedCoverStartDate(), expectedLoanDate);

    unconditionalCompletedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // - Cover start dates that have NOT changed are rendered in the table
    // - `confirm start date` link/text should be updated
    //---------------------------------------------------------------

    const expectedIssuedBondDate = new Date(secondIssuedSubmittedBond.requestedCoverStartDate).toLocaleDateString('en-GB');

    cy.assertText(secondIssuedSubmittedBondRow.requestedCoverStartDate(), expectedIssuedBondDate);

    secondIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    cy.assertText(secondUnconditionalSubmittedLoanRow.requestedCoverStartDate(), expectedIssuedBondDate);

    secondUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    //---------------------------------------------------------------
    // Maker selects 'no, do not change date, keep existing date' for a Bond
    // in Confirm start date form
    //---------------------------------------------------------------

    // Fourth bond
    fourthIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    fourthIssuedSubmittedBondRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    cy.assertText(fourthIssuedSubmittedBondRow.requestedCoverStartDate(), expectedIssuedBondDate);

    //---------------------------------------------------------------
    // Maker selects 'no, do not change date, keep existing date' for a Loan
    // in Confirm start date form
    //---------------------------------------------------------------
    // Fourth loan
    fourthUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('be.visible');
    fourthUnconditionalSubmittedLoanRow.changeOrConfirmCoverStartDateLink().should('contain.text', 'Start date confirmed');

    cy.assertText(fourthUnconditionalSubmittedLoanRow.requestedCoverStartDate(), expectedLoanDate);

    //---------------------------------------------------------------
    // Maker can resubmit deal now, after all cover start dates have been confirmed
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    cy.clickProceedToReviewButton();
    cy.keyboardInput(pages.contractReadyForReview.comments(), 'Updated cover start dates');
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

      cy.assertText(issuedSubmittedBondRow.issueFacilityLink(), 'Facility issued');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanRow = pages.contract.loansTransactionsTable.row(loan._id);
      loanRow.changeOrConfirmCoverStartDateLink().should('not.exist');

      cy.assertText(unconditionalSubmittedLoanRow.issueFacilityLink(), 'Facility issued');
    });
  });
});

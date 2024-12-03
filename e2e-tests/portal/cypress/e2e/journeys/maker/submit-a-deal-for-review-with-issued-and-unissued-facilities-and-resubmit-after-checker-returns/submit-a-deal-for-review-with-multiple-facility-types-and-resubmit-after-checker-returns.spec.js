const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const dealReadyToSubmitToChecker = require('./dealReadyToSubmitToChecker');

const { BANK1_MAKER1, BANK1_CHECKER1, ADMIN } = MOCK_USERS;

context('A maker and checker can submit and re-submit a deal to each other multiple times', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealReadyToSubmitToChecker, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealReadyToSubmitToChecker;

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

  const assertFacilityTableValuesWithDealStatusInDraft = () => {
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.bondStatus(), 'Completed');
      cy.assertText(bondRow.facilityStage(), bond.facilityStage);

      bondRow.deleteLink().should('be.visible');
      bondRow.issueFacilityLink().should('not.exist');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.loanStatus(), 'Completed');
      cy.assertText(loanRow.facilityStage(), loan.facilityStage);

      loanRow.deleteLink().should('be.visible');
      loanRow.issueFacilityLink().should('not.exist');
    });
  };

  const assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired = () => {
    const unissuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Unissued');
    const issuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Issued');

    const conditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.bondStatus(), 'Completed');
      cy.assertText(bondRow.facilityStage(), bond.facilityStage);

      bondRow.issueFacilityLink().should('not.exist');
      bondRow.deleteLink().should('be.visible');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.bondStatus(), 'Completed');
      cy.assertText(bondRow.facilityStage(), bond.facilityStage);

      bondRow.issueFacilityLink().should('not.exist');
      bondRow.deleteLink().should('be.visible');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.loanStatus(), 'Completed');
      cy.assertText(loanRow.facilityStage(), loan.facilityStage);

      loanRow.issueFacilityLink().should('not.exist');
      loanRow.deleteLink().should('be.visible');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.loanStatus(), 'Completed');
      cy.assertText(loanRow.facilityStage(), loan.facilityStage);

      loanRow.issueFacilityLink().should('not.exist');
      loanRow.deleteLink().should('be.visible');
    });
  };

  const assertFacilityTableValuesWithDealStatusInReadyForChecker = () => {
    const unissuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Unissued');
    const issuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Issued');

    const conditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.bondStatus(), 'Completed');
      cy.assertText(bondRow.facilityStage(), bond.facilityStage);

      bondRow.issueFacilityLink().should('not.exist');
      bondRow.deleteLink().should('not.exist');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.bondStatus(), 'Completed');
      cy.assertText(bondRow.facilityStage(), bond.facilityStage);

      bondRow.issueFacilityLink().should('not.exist');
      bondRow.deleteLink().should('not.exist');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.loanStatus(), 'Completed');
      cy.assertText(loanRow.facilityStage(), loan.facilityStage);

      loanRow.issueFacilityLink().should('not.exist');
      loanRow.deleteLink().should('not.exist');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.loanStatus(), 'Completed');
      cy.assertText(loanRow.facilityStage(), loan.facilityStage);

      loanRow.issueFacilityLink().should('not.exist');
      loanRow.deleteLink().should('not.exist');
    });
  };

  it('Unchanged/unissued Facility statuses should be retained as they were in Draft (`Completed`) during all stages of submits/re-submits; `Delete` or `Issue Facility` links should appear for correct facility types.', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInDraft();

    cy.clickProceedToReviewButton();
    cy.keyboardInput(pages.contractReadyForReview.comments(), 'Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker returns deal to maker
    //---------------------------------------------------------------

    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);

    cy.clickReturnToMakerButton();
    cy.keyboardInput(pages.contractReturnToMaker.comments(), 'Nope');
    cy.clickReturnToMakerButton();

    //---------------------------------------------------------------
    // maker views deal
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired();

    //---------------------------------------------------------------
    // maker re-submits deal with no changes
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    cy.clickProceedToReviewButton();
    cy.keyboardInput(pages.contractReadyForReview.comments(), 'Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInReadyForChecker();
  });
});

const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { fillAndSubmitIssueBondFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const { fillAndSubmitIssueLoanFacilityForm } = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker can issue and submit issued bond and loan facilities with a deal in `Acknowledged` status', () => {
  let deal;
  let dealId;
  let firstBondRow;
  let firstBondId;
  let thirdBondRow;
  let thirdBondId;
  let firstLoanRow;
  let firstLoanId;
  let thirdLoanRow;
  let thirdLoanId;
  let incompleteIssueFacilityBondId;
  let incompleteIssueFacilityBondRow;
  let incompleteIssueFacilityLoanId;
  let incompleteIssueFacilityLoanRow;

  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  beforeEach(() => {
    // Login and visit the deal
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    firstBondId = dealFacilities.bonds[0]._id;
    firstBondRow = pages.contract.bondTransactionsTable.row(firstBondId);

    thirdBondId = dealFacilities.bonds[2]._id;
    thirdBondRow = pages.contract.bondTransactionsTable.row(thirdBondId);

    firstLoanId = dealFacilities.loans[0]._id;
    firstLoanRow = pages.contract.loansTransactionsTable.row(firstLoanId);

    thirdLoanId = dealFacilities.loans[2]._id;
    thirdLoanRow = pages.contract.loansTransactionsTable.row(thirdLoanId);

    incompleteIssueFacilityBondId = dealFacilities.bonds[1]._id;
    incompleteIssueFacilityBondRow = pages.contract.bondTransactionsTable.row(incompleteIssueFacilityBondId);

    incompleteIssueFacilityLoanId = dealFacilities.loans[1]._id;
    incompleteIssueFacilityLoanRow = pages.contract.loansTransactionsTable.row(incompleteIssueFacilityLoanId);
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

  it('Complete few facilities for submission', () => {
    pages.contract.proceedToReview().should('not.exist');

    //---------------------------------------------------------------
    // check initial facility stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      cy.assertText(bondRow.facilityStage(), 'Unissued');

      cy.assertText(bondRow.bondStatus(), 'Not started');

      cy.assertText(bondRow.issueFacilityLink(), 'Issue facility');

      bondRow
        .issueFacilityLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/contract/${dealId}/bond/${bondId}/issue-facility`);
        });
    });

    //---------------------------------------------------------------
    // check initial Loan stage, status and issue facility link
    //---------------------------------------------------------------
    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(loanRow.facilityStage(), 'Conditional');

      cy.assertText(loanRow.loanStatus(), 'Not started');

      cy.assertText(loanRow.issueFacilityLink(), 'Issue facility');

      loanRow
        .issueFacilityLink()
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/contract/${dealId}/loan/${loanId}/issue-facility`);
        });
    });

    //---------------------------------------------------------------
    // makers completes first Bond Issue Facility form
    //---------------------------------------------------------------
    firstBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${firstBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(firstBondRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(firstBondRow.bondStatus(), 'Completed');

    //---------------------------------------------------------------
    // makers completes third Bond Issue Facility form
    //---------------------------------------------------------------
    thirdBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${thirdBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(thirdBondRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(thirdBondRow.bondStatus(), 'Completed');

    //---------------------------------------------------------------
    // makers completes one Loan Issue Facility form
    //---------------------------------------------------------------
    firstLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${firstLoanId}/issue-facility`));

    fillAndSubmitIssueLoanFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(firstLoanRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(firstLoanRow.loanStatus(), 'Completed');

    //---------------------------------------------------------------
    // makers completes third Loan Issue Facility form
    //---------------------------------------------------------------
    thirdLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${thirdLoanId}/issue-facility`));

    fillAndSubmitIssueLoanFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(thirdLoanRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(thirdLoanRow.loanStatus(), 'Completed');
  });

  it('Maker start a bond and a loan and does not finish the whole journey', () => {
    //---------------------------------------------------------------
    // Maker starts, but does not finish, a different Issue Facility form (Bond)
    //---------------------------------------------------------------

    incompleteIssueFacilityBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${incompleteIssueFacilityBondId}/issue-facility`));

    pages.bondIssueFacility.name().type('1234');
    pages.bondIssueFacility.submit().click();
    pages.bondIssueFacility.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond with incomplete Issue Facility form
    // - status should not be updated
    // - link remains the same
    //---------------------------------------------------------------
    cy.assertText(incompleteIssueFacilityBondRow.issueFacilityLink(), 'Issue facility');
    cy.assertText(incompleteIssueFacilityBondRow.bondStatus(), 'Incomplete');

    //---------------------------------------------------------------
    // Maker starts, but does not finish, a different Issue Facility form (Loan)
    //---------------------------------------------------------------

    incompleteIssueFacilityLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${incompleteIssueFacilityLoanId}/issue-facility`));

    pages.loanIssueFacility.disbursementAmount().type('1234');
    pages.loanIssueFacility.submit().click();
    pages.loanIssueFacility.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Loan with incomplete Issue Facility form
    // - status should not be updated
    // - link remains the same
    //---------------------------------------------------------------
    cy.assertText(incompleteIssueFacilityLoanRow.issueFacilityLink(), 'Issue facility');
    cy.assertText(incompleteIssueFacilityLoanRow.loanStatus(), 'Incomplete');
  });

  it('Maker is unable to submit the application', () => {
    //---------------------------------------------------------------
    // Ensure Maker cannot submit a deal with `Incomplete` facilities
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.exist');
  });

  it('Maker completes the incomplete facilities', () => {
    //---------------------------------------------------------------
    // Maker resumes the incomplete Issue Facility form (Bond)
    //---------------------------------------------------------------

    incompleteIssueFacilityBondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${incompleteIssueFacilityBondId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(incompleteIssueFacilityBondRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(incompleteIssueFacilityBondRow.bondStatus(), 'Completed');

    //---------------------------------------------------------------
    // Maker resumes the incomplete Issue Facility form (Loan)
    //---------------------------------------------------------------

    incompleteIssueFacilityLoanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${incompleteIssueFacilityLoanId}/issue-facility`));

    fillAndSubmitIssueBondFacilityForm();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    //---------------------------------------------------------------
    // Bond facility link and status should be updated
    //---------------------------------------------------------------
    cy.assertText(incompleteIssueFacilityLoanRow.issueFacilityLink(), 'Facility issued');
    cy.assertText(incompleteIssueFacilityLoanRow.loanStatus(), 'Completed');
  });

  it('Maker is now able to submit the application', () => {
    //---------------------------------------------------------------
    // Maker submit's deal for review
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued a bond');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // Deal should be updated
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    cy.assertText(pages.contract.status(), "Ready for Checker's approval");
    cy.assertText(pages.contract.previousStatus(), 'Acknowledged');
  });

  it('Verify facility stage, status and link post submission to the checker', () => {
    //---------------------------------------------------------------
    // Facilities that have been issued should have updated:
    // - status
    // - stage
    // - issue facility link/text
    //---------------------------------------------------------------
    cy.assertText(firstBondRow.bondStatus(), 'Ready for check');

    cy.assertText(firstBondRow.facilityStage(), 'Issued');

    cy.assertText(firstBondRow.issueFacilityLink(), 'Facility issued');

    firstBondRow
      .issueFacilityLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/contract/${dealId}/submission-details#bond-${firstBondId}`);
      });

    cy.assertText(firstLoanRow.loanStatus(), 'Ready for check');

    cy.assertText(firstLoanRow.facilityStage(), 'Unconditional');

    cy.assertText(firstLoanRow.issueFacilityLink(), 'Facility issued');

    firstLoanRow
      .issueFacilityLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/contract/${dealId}/submission-details#loan-${firstLoanId}`);
      });
  });

  it('Verify buttons are in correct state', () => {
    pages.contract.proceedToReview().should('not.exist');
    pages.contract.abandonButton().should('be.disabled');
  });
});

const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const MIADealAcceptedStatusWithUnissuedFacilities = require('./MIN-deal-accepted-status-with-unissued-facilities');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { fillAndSubmitIssueBondFacilityForm } = require('../../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const { fillAndSubmitIssueLoanFacilityForm } = require('../../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('A maker issues facilities, submits to checker; checker submits deal to UKEF', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MIADealAcceptedStatusWithUnissuedFacilities, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = MIADealAcceptedStatusWithUnissuedFacilities;

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

  it('Facility statuses should be updated, checker can only review the Issue Facility details', () => {
    //---------------------------------------------------------------
    // maker adds Issued Facilities and submits deal for review by checker
    //---------------------------------------------------------------

    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    // complete issue Bond facility form
    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();
    fillAndSubmitIssueBondFacilityForm();

    // complete issue loan facility form
    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();
    fillAndSubmitIssueLoanFacilityForm();

    // check facility statuses are correct

    cy.assertText(bondRow.bondStatus(), 'Completed');

    cy.assertText(loanRow.loanStatus(), 'Completed');

    // submit deal for review
    cy.clickProceedToReviewButton();

    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);

    // check facility statuses have changed
    cy.assertText(bondRow.bondStatus(), 'Ready for check');

    cy.assertText(loanRow.loanStatus(), 'Ready for check');

    cy.clickProceedToSubmitButton();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // deal status should be updated to `Acknowledged`
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    cy.assertText(pages.contract.status(), 'Acknowledged');

    //---------------------------------------------------------------
    // facility statuses should be updated to `Acknowledged`
    //---------------------------------------------------------------

    cy.assertText(bondRow.bondStatus(), 'Acknowledged');

    cy.assertText(loanRow.loanStatus(), 'Acknowledged');

    //---------------------------------------------------------------
    // Checker can only review issue facility details
    //---------------------------------------------------------------
    cy.assertText(bondRow.issueFacilityLink(), 'Facility issued');

    cy.assertText(loanRow.issueFacilityLink(), 'Facility issued');

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#bond-${bondId}`));

    pages.contract.visit(deal);
    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#loan-${loanId}`));
  });
});

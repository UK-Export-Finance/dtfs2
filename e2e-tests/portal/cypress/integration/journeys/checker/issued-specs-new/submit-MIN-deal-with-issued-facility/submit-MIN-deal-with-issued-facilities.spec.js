const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const MIADealAcceptedStatusWithUnissuedFacilities = require('./MIN-deal-accepted-status-with-unissued-facilities');
const MOCK_USERS = require('../../../../../fixtures/users');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

context('A maker issues facilities, submits to checker; checker submits deal to UKEF', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MIADealAcceptedStatusWithUnissuedFacilities, BANK1_MAKER1)
      .then((insertedDeal) => {
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

    cy.loginBANK1_MAKER1;
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
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    // submit deal for review
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    // check facility statuses have changed
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // deal status should be updated to `Submitted`
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      // Status is submitted until TFM background process has created UKEF IDs
      expect(text.trim()).to.equal('Submitted');
    });

    //---------------------------------------------------------------
    // facility statuses should be updated to `Submitted`
    //---------------------------------------------------------------

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    //---------------------------------------------------------------
    // Checker can only review issue facility details
    //---------------------------------------------------------------
    bondRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#bond-${bondId}`));

    pages.contract.visit(deal);
    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#loan-${loanId}`));
  });
});

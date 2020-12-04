const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const MIADealAcceptedStatusWithUnissuedFacilities = require('./MIN-deal-accepted-status-with-unissued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityForm,
} = require('../../../maker/submit-issued-facilities-for-review/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityForm,
} = require('../../../maker/submit-issued-facilities-for-review/fillAndSubmitIssueLoanFacilityForm');

const CHECKER_LOGIN = mockUsers.find(user => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker issues facilities, submits to checker; checker submits deal to UKEF', () => {
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
    cy.insertOneDeal(MIADealAcceptedStatusWithUnissuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Facility statuses should be updated, checker can only review the Issue Facility details', () => {
    //---------------------------------------------------------------
    // maker adds Issued Facilities and submits deal for review by checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    // complete issue bond facility form
    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();
    fillAndSubmitIssueBondFacilityForm();

    // complete issue loan facility form
    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
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
    cy.login({ ...CHECKER_LOGIN });
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
    // deal and facility status should be updated to `Submitted`
    //---------------------------------------------------------------
    pages.contract.visit(deal);

    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

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

    // TODO: assert that if user tries to navigate to a bond or loan form, you go to unauth page.
  });
});

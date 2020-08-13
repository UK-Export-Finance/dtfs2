const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithIssuedFacilitiesReadyForReview = require('./dealWithIssuedFacilitiesReadyForReview');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));

context('A checker submit a deal with issued loan/bond facilities', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.insertOneDeal(dealWithIssuedFacilitiesReadyForReview, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Checker can view (but not edit) Issued facilities and after re-submitting the deal, the Deal/facilities should be updated', () => {
    cy.login(CHECKER_LOGIN);
    pages.contract.visit(deal);

    // assert that the Checker can navigate to and view bond details on the Deal submissions page
    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);
    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#bond-${bondId}`));

    // go back to deal page
    pages.contractSubmissionDetails.goBackLink().click();

    // assert that the Checker can navigate to and view loan details on the Deal submissions page
    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);
    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details#loan-${loanId}`));

    // go back to deal page
    pages.contractSubmissionDetails.goBackLink().click();

    // submit the deal
    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    // expect the deal status to be updated
    pages.contract.visit(deal);
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });
    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    //
    // issued bonds
    //

    // expect the bond status to be updated
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    // expect bond issue facility link to not exist
    bondRow.issueFacilityLink().should('not.exist');

    // expect bond delete link to not exist
    bondRow.deleteLink().should('not.exist');

    //
    // issued loans
    //

    // expect the loan status to be updated
    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    // expect loan issue facility link to not exist
    loanRow.issueFacilityLink().should('not.exist');

    // expect loan delete link to not exist
    loanRow.deleteLink().should('not.exist');

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.returnToMaker().should('not.exist');
  });
});

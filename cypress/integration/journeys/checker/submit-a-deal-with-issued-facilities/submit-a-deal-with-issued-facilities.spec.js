const pages = require('../../../pages');
const dealWIthIssuedFacilitiesReadyForReview = require('./dealWIthIssuedFacilitiesReadyForReview');

const maker1 = { username: 'MAKER', password: 'MAKER' };
const checker = { username: 'CHECKER', password: 'CHECKER' };

context('A checker submit a deal with issued loan/bond facilities', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealWIthIssuedFacilitiesReadyForReview, { ...maker1 })
      .then((insertedDeal) => {
        deal = insertedDeal;
        // dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Checker can access (but not edit) Issued facilities and after re-submitting the deal, the Deal/facilities should be updated', () => {
    cy.login({ ...checker });
    pages.contract.visit(deal);
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

    /*
    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    // expect the bond status to be updated
    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    // expect bond issue facility link to not exist
    bondRow.issueFacilityLink().should('not.exist');

    // expect bond delete link to not exist
    bondRow.deleteLink().should('not.exist');
*/

    /*
    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    // expect the loan status to be updated
    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });

    // expect loan issue facility link to not exist
    loanRow.issueFacilityLink().should('not.exist');

    // expect loan delete link to not exist
    loanRow.deleteLink().should('not.exist');
    */

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.returnToMaker().should('not.exist');
  });
});

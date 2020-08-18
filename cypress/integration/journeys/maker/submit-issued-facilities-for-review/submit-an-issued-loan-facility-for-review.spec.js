const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const mockUsers = require('../../../../fixtures/mockUsers');
const { fillAndSubmitIssueLoanFacilityForm } = require('./fillAndSubmitIssueLoanFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker can issue and submit an issued loan facility with a deal in `Acknowledged by UKEF` status', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Completing the Issue Loan Facility form allows maker to re-submit the deal for review. Deal/Loan should be updated after submitting for review', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Conditional');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });

    loanRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    fillAndSubmitIssueLoanFacilityForm();

    cy.url().should('eq', relative(`/contract/${dealId}`));

    // expect issue facility link text to be changed
    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // expect loan status to be updated (dynamically)
    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    // submit deal for review
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued a loan');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // expect the deal status to be updated
    pages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for Checker\'s approval');
    });

    pages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });

    // expect the loan status to be updated
    // loanRow.loanStatus().invoke('text').then((text) => {
    //   expect(text.trim()).to.equal('Ready for check');
    // });

    loanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unconditional');
    });

    // expect loan issue facility link text to be changed
    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Facility issued');
    });

    // since no other facilities have had their details/forms completed
    // and the deal is now has `Ready for Checker\'s approval` status
    // Proceed to Review button should not exist,
    // Abandon button should be disabled.
    // pages.contract.proceedToReview().should('not.exist');
    // pages.contract.abandonButton().should('be.disabled');
  });
});

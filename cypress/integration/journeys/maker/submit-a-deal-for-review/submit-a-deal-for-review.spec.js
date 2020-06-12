const moment = require('moment');
const { contract, contractReadyForReview, defaults } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const maker1 = { username: 'MAKER', password: 'MAKER' };

// test data we want to set up + work with..
const dealWithIncompleteBonds = require('./dealWithIncompleteBonds.json');
const dealWithIncompleteAbout = require('./dealWithIncompleteAbout.json');
const dealWithIncompleteEligibility = require('./dealWithIncompleteEligibility.json');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const dealWithNoBondCoverStartDate = require('./dealWithNoBondCoverStartDate');
const dealWithNoLoanCoverStartDate = require('./dealWithNoLoanCoverStartDate');

context('A maker selects to submit a contract for review from the view-contract page', () => {
  let deals = {};

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(maker1);
    cy.insertOneDeal(dealWithIncompleteBonds, { ...maker1 })
      .then((insertedDeal) => deals.dealWithIncompleteBonds = insertedDeal);

    cy.insertOneDeal(dealWithIncompleteAbout, { ...maker1 })
      .then((insertedDeal) => deals.dealWithIncompleteAbout = insertedDeal);

    cy.insertOneDeal(dealWithIncompleteEligibility, { ...maker1 })
      .then((insertedDeal) => deals.dealWithIncompleteEligibility = insertedDeal);

    cy.insertOneDeal(dealReadyToSubmitForReview, { ...maker1 })
      .then((insertedDeal) => deals.dealReadyToSubmitForReview = insertedDeal);

    cy.insertOneDeal(dealWithNoBondCoverStartDate, { ...maker1 })
      .then((insertedDeal) => deals.dealWithNoBondCoverStartDate = insertedDeal);

    cy.insertOneDeal(dealWithNoLoanCoverStartDate, { ...maker1 })
      .then((insertedDeal) => deals.dealWithNoLoanCoverStartDate = insertedDeal);
  });

  describe('When a deal does NOT have Eligibility with `Completed` status', () => {

    it('User cannot proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(deals.dealWithIncompleteEligibility);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has Bonds that are NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(deals.dealWithIncompleteBonds);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has About-supply-contract that is NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(deals.dealWithIncompleteAbout);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('when a deal has Completed Eligibility and Bonds', () => {
    it('User can proceed to submit the deal for review', () => {
      const deal = deals.dealReadyToSubmitForReview;

      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
    });

    it('The cancel button returns the user to the view-contract page.', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().click();

      // cancel
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });

    it('The ReadyForCheckersApproval button generates an error if no comment has been entered.', () => {
      const deal = deals.dealReadyToSubmitForReview;
      // log in, visit a deal, select abandon
      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().click();

      cy.title().should('eq', `Ready for review - ${deal.details.bankSupplyContractName}${defaults.pageTitleAppend}`);

      // submit without a comment
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to stay on the submit-for-review page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
      contractReadyForReview.expectError('Comment is required when submitting a deal for review.');
    });

    it('The Ready for Checkers Review button updates the deal and takes the user to /dashboard.', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().click();

      // submit with a comment
      contractReadyForReview.comments().type('a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted for review./);
      });

      // visit the deal and confirm the updates have been made
      contract.visit(deal);
      contract.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal("Ready for Checker's approval");
      });
      contract.previousStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Draft');
      });
    });
  });

  describe('when a deal has Completed Eligibility and a Bond with `issued` bondStage and no Requested Cover Start Date', () => {
    it('should use todays date for the Bond in Deal page', () => {
      const deal = deals.dealWithNoBondCoverStartDate;

      cy.login({ ...maker1 });
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      contractReadyForReview.comments().type('a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      cy.url().should('include', '/dashboard');

      successMessage.successMessageLink().click();

      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const bondId = deal.bondTransactions.items[0]._id;
      const row = contract.bondTransactionsTable.row(bondId);

      const expectedDate = moment().format('DD/MM/YYYY');
      row.requestedCoverStartDate().should('contain.text', expectedDate);
    });
  });

  describe('when a deal has Completed Eligibility and a Loan with `Unconditional` facilityStage and no Requested Cover Start Date', () => {
    it('should use todays date for the Loan in Deal page', () => {
      const deal = deals.dealWithNoLoanCoverStartDate;

      cy.login({ ...maker1 });
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      contractReadyForReview.comments().type('a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      cy.url().should('include', '/dashboard');

      successMessage.successMessageLink().click();

      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const loanId = deal.loanTransactions.items[0]._id;
      const row = contract.loanTransactionsTable.row(loanId);

      const expectedDate = moment().format('DD/MM/YYYY');
      row.requestedCoverStartDate().should('contain.text', expectedDate);
    });
  });
});

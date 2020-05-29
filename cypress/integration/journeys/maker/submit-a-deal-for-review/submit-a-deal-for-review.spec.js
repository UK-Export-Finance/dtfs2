const moment = require('moment');
const { contract, contractReadyForReview, defaults } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const maker1 = { username: 'MAKER', password: 'MAKER' };

// test data we want to set up + work with..
const twentyOneDeals = require('../dashboard/twentyOneDeals');
const dealWithIncompleteBonds = require('./dealWithIncompleteBonds.json');
const dealWithCompletedEligibilityAndBonds = require('./dealWithCompletedEligibilityAndBonds.json');
const { dealWithIssuedBondAndNoCoverStartDate } = require('./dealWithIssuedBondAndNoCoverStartDate');

context('A maker selects to submit a contract for review from the view-contract page', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    const aDealInStatus = (status) => twentyOneDeals.filter((deal) => status === deal.details.status)[0];
    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealInStatus('Draft'), { ...maker1 })
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('When a deal does NOT have Eligibility with `Completed` status', () => {
    let dealWithInCompleteEligibilityStatus;

    beforeEach(() => {
      dealWithInCompleteEligibilityStatus = twentyOneDeals.find((d) =>
        (d.details.status === 'Draft' && d.eligibility && d.eligibility.status !== 'Completed'));

      cy.insertOneDeal(dealWithInCompleteEligibilityStatus, { ...maker1 })
        .then((insertedDeal) => dealWithInCompleteEligibilityStatus = insertedDeal);
    });

    it('User cannot proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(dealWithInCompleteEligibilityStatus);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has Bonds that are NOT `Completed`', () => {
    beforeEach(() => {
      cy.insertOneDeal(dealWithIncompleteBonds, { ...maker1 })
        .then((insertedDeal) => deal = insertedDeal);
    });

    it('User cannot proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('when a deal has Completed Eligibility and Bonds', () => {
    beforeEach(() => {
      cy.insertOneDeal(dealWithCompletedEligibilityAndBonds, { ...maker1 })
        .then((insertedDeal) => deal = insertedDeal);
    });

    it('User can proceed to submit the deal for review', () => {
      cy.login({ ...maker1 });
      contract.visit(deal);
      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
    });
  });

  describe('when a deal has Completed Eligibility and a Bond with `Issued` bond stage without a Cover Start Date', () => {
    beforeEach(() => {
      cy.insertOneDeal(dealWithIssuedBondAndNoCoverStartDate, { ...maker1 })
        .then((insertedDeal) => deal = insertedDeal);
    });

    it('should use todays date for the Bond in Deal page', () => {
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

      const expectedDate = moment().format('DD/MM/YYYY')
      row.requestedCoverStartDate().invoke('text').then((text) => {
        expect(text.trim()).equal(expectedDate);
      });
    });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
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

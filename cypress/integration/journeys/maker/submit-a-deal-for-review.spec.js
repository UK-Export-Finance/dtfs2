const {contract, contractReadyForReview} = require('../../pages');
const {errorSummary, successMessage} = require('../../partials');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('./dashboard/twentyOneDeals');


context('A maker selects to abandon a contract from the view-contract page', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    const aDealInStatus = (status) => {
      return twentyOneDeals.filter( deal=>status === deal.details.status)[0];
    };

    cy.deleteDeals(maker1);
    cy.insertOneDeal(aDealInStatus('Draft'), { ...maker1 });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login({...maker1});

    cy.aDealInStatus("Draft").then( (deal) => {
      contract.visit(deal);
      contract.proceedToReview().click();

      // cancel
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });
  });

  xit('The ReadyForCheckersApproval button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login({...maker1});
    cy.aDealInStatus("Draft").then( (deal) => {
      contract.visit(deal);
      contract.proceedToReview().click();

      // submit without a comment
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to land on the /start-now page with a success message
      cy.url().should('eq', relative(`/start-now`));
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted for review./);
      });
      // expect to stay on the /ready-for-review page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
      contractDelete.expectError('Comment is required when submitting a deal for review.');
    });

  });

  it('The Ready for Checkers Review button updates the deal and takes the user to /start-now.', () => {
    // log in, visit a deal, select abandon
    cy.login({...maker1});

    cy.aDealInStatus("Draft").then( (deal) => {
      contract.visit(deal);
      contract.proceedToReview().click();

      // submit with a comment
      contractReadyForReview.comments().type('a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to land on the /start-now page with a success message
      cy.url().should('eq', relative(`/start-now`));
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

});

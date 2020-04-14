const {contract, contractDelete} = require('../../pages');
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
    cy.aDealInStatus("Draft").then( (deal) => {
      // log in, visit a deal, select abandon
      cy.login({...maker1});
      contract.visit(deal);
      contract.abandon().click();

      // cancel
      contractDelete.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });
  });

  it('The abandon button generates an error if no comment has been entered.', () => {
    cy.aDealInStatus("Draft").then( (deal) => {
      // log in, visit a deal, select abandon
      cy.login({...maker1});
      contract.visit(deal);
      contract.abandon().click();

      // submit without a comment
      contractDelete.comments().should('have.value', '');
      contractDelete.abandon().click();

      // expect to stay on the abandon page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/delete`));
      contractDelete.expectError('Comment is required when abandoning a deal.');
    });
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /start-now.', () => {
    cy.aDealInStatus("Draft").then( (deal) => {
      // log in, visit a deal, select abandon
      cy.login({...maker1});
      contract.visit(deal);
      contract.abandon().click();

      // submit with a comment
      contractDelete.comments().type('a mandatory comment');
      contractDelete.abandon().click();

      // expect to land on the /start-now page with a success message
      cy.url().should('eq', relative(`/start-now`));
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract abandoned./);
      });


      // visit the deal and confirm the updates have been made
      contract.visit(deal);
      contract.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Abandoned Deal');
      });
      contract.previousStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Draft');
      });
    });

  });

});

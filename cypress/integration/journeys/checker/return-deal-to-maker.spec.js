const {contract, contractReturnToMaker} = require('../../pages');
const {errorSummary, successMessage} = require('../../partials');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');


context('A checker selects to return a deal to maker from the view-contract page', () => {

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
    cy.insertOneDeal(aDealInStatus("Ready for Checker's approval"), { ...maker1 });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    cy.aDealInStatus("Ready for Checker's approval").then( (deal) => {
      // log in, visit a deal, select abandon
      cy.login({...checker});
      contract.visit(deal);
      contract.returnToMaker().click();

      // cancel
      contractReturnToMaker.comments().should('have.value', '');
      contractReturnToMaker.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });
  });

  it('The Return to Maker button generates an error if no comment has been entered.', () => {
    cy.aDealInStatus("Ready for Checker's approval").then( (deal) => {

      // log in, visit a deal, select abandon
      cy.login({...checker});
      contract.visit(deal);
      contract.returnToMaker().click();

      // submit without a comment
      contractReturnToMaker.returnToMaker().click();

      // expect to stay on the abandon page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/return-to-maker`));
      contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
    });
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard.', () => {
    cy.aDealInStatus("Ready for Checker's approval").then( (deal) => {
      // log in, visit a deal, select abandon
      cy.login({...checker});
      contract.visit(deal);
      contract.returnToMaker().click();

      // submit with a comment
      contractReturnToMaker.comments().type('a mandatory comment');
      contractReturnToMaker.returnToMaker().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', `/dashboard`)
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract returned to maker./);
      });


      // visit the deal and confirm the updates have been made
      contract.visit(deal);
      contract.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal("Further Maker's input required");
      });
      contract.previousStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal("Ready for Checker's approval");
      });
    });

  });

});

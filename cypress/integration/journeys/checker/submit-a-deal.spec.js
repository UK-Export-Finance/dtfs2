const {contract, contractConfirmSubmission} = require('../../pages');
const {errorSummary, successMessage} = require('../../partials');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');


context('A checker selects to submit a contract from the view-contract page', () => {
  let deal;

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
    cy.insertOneDeal(aDealInStatus("Ready for Checker's approval"), { ...maker1 })
      .then(insertedDeal => deal=insertedDeal);
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login({...checker});
    contract.visit(deal);
    contract.proceedToSubmit().click();

    // cancel
    contractConfirmSubmission.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  it('The Accept and Submit button generates an error if the checkbox has not been ticked.', () => {
    // log in, visit a deal, select abandon
    cy.login({...checker});
    contract.visit(deal);
    contract.proceedToSubmit().click();

    // submit without checking the checkbox
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${deal._id}/confirm-submission`));
    contractConfirmSubmission.expectError('Acceptance is required.');
  });

  it('If the terms are accepted, the Accept and Submit button submits the deal and takes the user to /dashboard.', () => {
    // log in, visit a deal, select abandon
    cy.login({...checker});
    contract.visit(deal);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', `/dashboard`)
    successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
    });


    // visit the deal and confirm the updates have been made
    contract.visit(deal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Submitted");
    });
    contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Ready for Checker's approval");
    });

    // cy.downloadFile( deal, {...checker}).then( (typeA) =>{
    //   expect(typeA).not.to.equal('');
    // });

  });

});

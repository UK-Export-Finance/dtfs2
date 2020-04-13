const {login} = require('../../missions');
const {deleteAllDeals, createADeal} = require('../../missions/deal-api');
const {contract, contractReturnToMaker} = require('../../pages');
const {errorSummary, successMessage} = require('../../partials');
const relative = require('../../relativeURL');

const maker1 = {username: 'MAKER', password: 'MAKER'};
const checker = {username: 'CHECKER', password: 'CHECKER'};

// test data we want to set up + work with..
const twentyOneDeals = require('../maker/dashboard/twentyOneDeals');


context('A maker selects to abandon a contract from the view-contract page', () => {
  let deal;
  const aDealInStatus = (status) => {
    const candidates = twentyOneDeals.filter(deal=>deal.details.status===status);
    expect(candidates.length > 0);
    return candidates[0];
  };

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( async() => {
    // clean down anything our test-users have created
    await deleteAllDeals(maker1);
    // insert deals as each user
    deal = await createADeal(aDealInStatus("Ready for Checker's approval"), { ...maker1 });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    login({...checker});
    contract.visit(deal);
    contract.returnToMaker().click();

    // cancel
    contractReturnToMaker.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  it('The Return to Maker button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    login({...checker});
    contract.visit(deal);
    contract.returnToMaker().click();

    // submit without a comment
    contractReturnToMaker.returnToMaker().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${deal._id}/return-to-maker`));
    contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /start-now.', () => {
    // log in, visit a deal, select abandon
    login({...checker});
    contract.visit(deal);
    contract.returnToMaker().click();

    // submit with a comment
    contractReturnToMaker.comments().type('a mandatory comment');
    contractReturnToMaker.returnToMaker().click();

    // expect to land on the /start-now page with a success message
    cy.url().should('eq', relative(`/start-now`));
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

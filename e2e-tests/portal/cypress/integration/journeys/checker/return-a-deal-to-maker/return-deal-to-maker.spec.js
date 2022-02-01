const { contract, contractReturnToMaker, contractComments } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'UKEF test bank (Delegated)'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

context('A checker selects to return a deal to maker from the view-contract page', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => twentyOneDeals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealInStatus("Ready for Checker's approval"), MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
      });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(deal);
    contract.returnToMaker().click();

    // cancel
    contractReturnToMaker.comments().should('have.value', '');
    contractReturnToMaker.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  it('The Return to Maker button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(deal);
    contract.returnToMaker().click();

    // submit without a comment
    contractReturnToMaker.returnToMaker().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${deal._id}/return-to-maker`));
    contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(deal);

    contract.commentsTab().click();
    contract.visit(deal);

    contract.returnToMaker().click();

    // submit with a comment
    contractReturnToMaker.comments().type('to you');
    contractReturnToMaker.returnToMaker().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');
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

    // visit the comments page and prove that the comment has been added
    contract.commentsTab().click();
    contractComments.row(0).comment().invoke('text').then((text) => {
      expect(text.trim()).to.equal('to you');
    });
    contractComments.row(0).commentorName().invoke('text').then((text) => {
      expect(text.trim()).to.equal(`${CHECKER_LOGIN.firstname} ${CHECKER_LOGIN.surname}`);
    });
  });
});

const { contract, contractReturnToMaker, contractComments } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('A checker selects to return a deal to maker from the view-contract page', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => twentyOneDeals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus("Ready for Checker's approval"), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(deal);
    cy.clickReturnToMakerButton();

    // cancel
    contractReturnToMaker.comments().should('have.value', '');
    contractReturnToMaker.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  it('The Return to Maker button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(deal);
    cy.clickReturnToMakerButton();

    // submit without a comment
    cy.clickReturnToMakerButton();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${deal._id}/return-to-maker`));
    contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(deal);

    contract.commentsTab().click();
    contract.visit(deal);

    cy.clickReturnToMakerButton();

    // submit with a comment
    contractReturnToMaker.comments().type('to you');
    cy.clickReturnToMakerButton();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    successMessage
      .successMessageListItem()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Supply Contract returned to maker./);
      });

    // visit the deal and confirm the updates have been made
    contract.visit(deal);

    cy.assertText(contract.status(), "Further Maker's input required");

    cy.assertText(contract.previousStatus(), "Ready for Checker's approval");

    // visit the comments page and prove that the comment has been added
    contract.commentsTab().click();

    cy.assertText(contractComments.row(0).comment(), 'to you');

    cy.assertText(contractComments.row(0).commentorName(), `${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
  });
});

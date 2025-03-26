const { contract, contractDelete, contractComments } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relative = require('../../../relativeURL');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Input is cleaned to avoid Cross Site Scripting', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  it('should not allow <script> tag', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.abandonButton().click();

    // submit with a comment with script tag
    cy.keyboardInput(contractDelete.comments(), '<script>alert("XSS")</script>');
    contractDelete.abandon().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    // visit the deal and confirm the updates have been made
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.commentsTab().click();

    contractComments
      .row(0)
      .comment()
      .invoke('children')
      .then((children) => {
        expect(children.length).equal(0);
      });

    cy.assertText(contractComments.row(0).comment(), '<script>alert("XSS")</script>');
  });
});

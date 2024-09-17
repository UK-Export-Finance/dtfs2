const { contract, contractDelete, contractComments } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

context('Input is cleaned to avoid Cross Site Scripting', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => twentyOneDeals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus('Draft'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('Does not allow <script> tag', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.abandonButton().click();

    // submit with a comment with script tag
    cy.keyboardInput(contractDelete.comments(), '<script>alert("XSS")</script>');
    contractDelete.abandon().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    // visit the deal and confirm the updates have been made
    contract.visit(deal);
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

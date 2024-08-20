const { contract, contractDelete, defaults } = require('../../pages');
const { successMessage } = require('../../partials');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker selects to abandon a contract from the view-contract page', () => {
  let deal;

  before(() => {
    const aDealInStatus = (status) => twentyOneDeals.filter((aDeal) => status === aDeal.status)[0];

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealInStatus('Draft'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${deal.bankInternalRefName}`);
      });
    contract.abandonButton().click();

    cy.title().should('eq', `Abandon Deal${defaults.pageTitleAppend}`);

    cy.assertText(contractDelete.heading(), `Are you sure you want to abandon ${deal.additionalRefName}?`);

    // cancel
    contractDelete.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  it('The abandon button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${deal.bankInternalRefName}`);
      });
    contract.abandonButton().click();

    // submit without a comment
    contractDelete.comments().should('have.value', '');
    contractDelete.abandon().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${deal._id}/delete`));
    contractDelete.expectError('Comment is required when abandoning a deal.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    contract.visit(deal);
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${deal.bankInternalRefName}`);
      });
    contract.abandonButton().click();

    // submit with a comment
    contractDelete.comments().type('a mandatory comment');
    contractDelete.abandon().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    cy.assertText(successMessage.successMessageListItem(), 'Supply Contract abandoned.');

    // visit the deal and confirm the updates have been made
    contract.visit(deal);

    cy.assertText(contract.status(), 'Abandoned');

    cy.assertText(contract.previousStatus(), 'Draft');
  });
});

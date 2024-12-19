const { contract, contractDelete, defaults, dashboardDeals } = require('../../../pages');
const { successMessage } = require('../../../partials');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { additionalRefName, bankInternalRefName } = require('../../../../fixtures/deal');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker selects to abandon a contract from the view-contract page', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.loginGoToDealPage(BANK1_MAKER1);

    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${bankInternalRefName}`);
      });

    contract.abandonButton().click();

    cy.title().should('eq', `Abandon Deal${defaults.pageTitleAppend}`);

    cy.assertText(contractDelete.heading(), `Are you sure you want to abandon ${additionalRefName}?`);

    // cancel
    contractDelete.cancel().click();

    // check we've gone to the right page
    cy.url().should('include', '/contract');
  });

  it('The abandon button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    cy.clickDashboardDealLink();
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${bankInternalRefName}`);
      });
    contract.abandonButton().click();

    // submit without a comment
    contractDelete.comments().should('have.value', '');
    contractDelete.abandon().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('include', '/contract');
    contractDelete.expectError('Comment is required when abandoning a deal.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard', () => {
    // log in, visit a deal, select abandon
    cy.loginGoToDealPage(BANK1_MAKER1);
    contract.abandonLink().contains('Abandon');
    contract.abandonButton().click();

    // submit with a comment
    cy.keyboardInput(contractDelete.comments(), 'a mandatory comment');
    contractDelete.abandon().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    successMessage
      .successMessageListItem()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Supply Contract abandoned./);
      });

    // visit the deal and confirm the updates have been made
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    cy.assertText(contract.status(), 'Abandoned');

    cy.assertText(contract.previousStatus(), 'Draft');
  });
});

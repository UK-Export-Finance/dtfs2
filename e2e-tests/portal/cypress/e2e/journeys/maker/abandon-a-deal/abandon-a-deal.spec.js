const { contract, contractDelete, defaults } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker selects to abandon a contract from the view-contract page', () => {
  let bssDealId;

  const dummyDeal = {
    bankInternalRefName: '9',
    additionalRefName: 'UKEF test bank (Delegated)',
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  it('should cancel and return the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${dummyDeal.bankInternalRefName}`);
      });
    contract.abandonButton().click();

    cy.title().should('eq', `Abandon Deal${defaults.pageTitleAppend}`);

    cy.assertText(contractDelete.heading(), `Are you sure you want to abandon ${dummyDeal.additionalRefName}?`);

    // cancel
    contractDelete.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });

  it('should generate an error if no comment has been entered when abandoning.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${dummyDeal.bankInternalRefName}`);
      });
    contract.abandonButton().click();

    // submit without a comment
    contractDelete.comments().should('have.value', '');
    contractDelete.abandon().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${bssDealId}/delete`));
    contractDelete.expectError('Comment is required when abandoning a deal.');
  });

  it('should abandon the deal and take the user to /dashboard if a comment has been entered', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.abandonLink().contains('Abandon');
    contract
      .abandonLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Abandon Deal ${dummyDeal.bankInternalRefName}`);
      });
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
    cy.visit(relative(`/contract/${bssDealId}`));

    cy.assertText(contract.status(), 'Abandoned');

    cy.assertText(contract.previousStatus(), 'Draft');
  });
});

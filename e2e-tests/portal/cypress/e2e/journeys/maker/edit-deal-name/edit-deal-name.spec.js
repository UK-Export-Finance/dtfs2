const { contract, editDealName, defaults } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Edit deal name', () => {
  let bssDealId;
  let contractUrl;
  const additionalRefName = 'UKEF test bank (Delegated)';

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  it('should reject an empty field', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.title().should('eq', `Change name - ${additionalRefName}${defaults.pageTitleAppend}`);
    editDealName.additionalRefName().should('have.value', additionalRefName);
    editDealName.additionalRefName().clear();
    cy.clickSubmitButton();

    cy.url().should('eq', `${contractUrl}/edit-name`);

    editDealName.expectError('A value is required.');
  });

  it('should update deal.additionalRefName', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.keyboardInput(editDealName.additionalRefName(), '{selectall}{backspace}mock');
    cy.clickSubmitButton();

    cy.assertText(contract.additionalRefName(), 'mock');
  });
});

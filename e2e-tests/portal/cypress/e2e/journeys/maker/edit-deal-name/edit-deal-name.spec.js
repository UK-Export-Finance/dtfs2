const { contract, editDealName, defaults } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../../fixtures/deal');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Edit deal name', () => {
  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  it('rejects an empty field', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.title().should('eq', `Change name - ${additionalRefName}${defaults.pageTitleAppend}`);
    editDealName.additionalRefName().should('have.value', additionalRefName);
    cy.keyboardInput(editDealName.additionalRefName(), '{selectall}{backspace}');
    cy.clickSubmitButton();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/edit-name');

    editDealName.expectError('A value is required.');
  });

  it('updates deal.additionalRefName', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.keyboardInput(editDealName.additionalRefName(), '{selectall}{backspace}mock');
    cy.clickSubmitButton();

    cy.assertText(contract.additionalRefName(), 'mock');
  });
});

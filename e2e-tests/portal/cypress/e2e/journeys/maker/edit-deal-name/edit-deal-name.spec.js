const { contract, editDealName, dashboardDeals, defaults } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../../fixtures/deal');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Edit deal name', () => {
  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  it('rejects an empty field', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.title().should('eq', `Change name - ${additionalRefName}${defaults.pageTitleAppend}`);
    editDealName.additionalRefName().should('have.value', additionalRefName);
    cy.keyboardInput(editDealName.additionalRefName(), '{selectall}{backspace}');
    cy.clickSubmitButton();

    editDealName.expectError('A value is required.');
  });

  it('updates deal.additionalRefName', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    cy.keyboardInput(editDealName.additionalRefName(), '{selectall}{backspace}mock');
    cy.clickSubmitButton();

    cy.assertText(contract.additionalRefName(), 'mock');
  });
});

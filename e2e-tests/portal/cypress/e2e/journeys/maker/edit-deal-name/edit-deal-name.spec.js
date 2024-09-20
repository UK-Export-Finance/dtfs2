const { contract, editDealName, dashboardDeals } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Edit deal name', () => {
  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});
  });

  it('rejects an empty field', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    editDealName.additionalRefName().type('{selectall}{backspace}');
    cy.clickSubmitButton();

    editDealName.expectError('A value is required.');
  });

  it('updates deal.additionalRefName', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.editDealName().contains('Edit deal name');
    contract.editDealName().click();

    editDealName.additionalRefName().type('{selectall}{backspace}mock');
    cy.clickSubmitButton();

    cy.assertText(contract.additionalRefName(), 'mock');
  });
});

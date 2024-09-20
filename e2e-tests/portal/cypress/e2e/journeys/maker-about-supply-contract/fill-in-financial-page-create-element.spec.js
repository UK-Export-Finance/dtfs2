const { contract, contractAboutFinancial, dashboardDeals } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Financial page form - create element and check if inserted into deal', () => {
  before(() => {
    cy.createBssDeal({});
  });

  it("should not insert created element's data into the deal", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();

    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    cy.insertElement('financial-form');

    contractAboutFinancial.preview().click();
  });
});

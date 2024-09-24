const { contract, contractAboutFinancial, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../fixtures/deal');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Financial page form - create element and check if inserted into deal', () => {
  before(() => {
    cy.createBssEwcsDeal({});
  });

  it("should not insert created element's data into the deal", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    cy.title().should('eq', `Financial information - ${additionalRefName}${defaults.pageTitleAppend}`);

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    cy.insertElement('financial-form');

    contractAboutFinancial.preview().click();

    cy.getDealIdFromUrl().then((dealId) => {
      cy.getDeal(dealId, BANK1_MAKER1).then((updatedDeal) => {
        // ensure the updated deal does not contain additional intruder field
        expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
      });
    });
  });
});

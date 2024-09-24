const { contract, contractAboutFinancial, defaults, dashboardDeals } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../fixtures/deal');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  before(() => {
    cy.createBssEwcsDeal({});
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    cy.title().should('eq', `Financial information - ${additionalRefName}${defaults.pageTitleAppend}`);

    // prove the exchange-rate fields start hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    // prove the exchange-rate fields stay hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    contractAboutFinancial.saveAndGoBack().click();

    // check that the preview page renders the Submission Details component
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    cy.assertText(partials.taskListHeader.itemStatus('financial-information'), 'Completed');
  });
});

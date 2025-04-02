const { contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { today } = require('../../../../../e2e-fixtures/dateConstants');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = `/contract/${bssDealId}`;
    });
    cy.completeAboutSupplierSection({
      exporterCompanyName: 'Exporter Company Name',
    });
    cy.completeAboutBuyerSection();
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    cy.visit(contractUrl);
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '10,000');
    contractAboutFinancial.supplyContractCurrency().select('USD');
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '1.123456');

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), today.day);

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), today.month);

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), today.year);

    contractAboutFinancial.saveAndGoBack().click();

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // check that the preview page renders the Submission Details component
    cy.visit(`${contractUrl}/about/check-your-answers`);
    contractAboutPreview.submissionDetails().should('be.visible');
  });
});

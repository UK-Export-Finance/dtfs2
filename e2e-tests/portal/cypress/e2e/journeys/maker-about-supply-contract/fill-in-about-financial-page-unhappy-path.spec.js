const { contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '10,000');
    contractAboutFinancial.supplyContractCurrency().select('USD');
    cy.keyboardInput(contractAboutFinancial.supplyContractConversionRateToGBP(), '1.123456');

    const today = new Date();

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().day(), `${today.getDate()}`);

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().month(), `${today.getMonth() + 1}`);

    cy.keyboardInput(contractAboutFinancial.supplyContractConversionDate().year(), `${today.getFullYear()}`);

    contractAboutFinancial.saveAndGoBack().click();

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');
  });
});

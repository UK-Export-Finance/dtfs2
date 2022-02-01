const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');
const partials = require('../../../partials');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

// test data we want to set up + work with..
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(MAKER_LOGIN);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10,000');
    contractAboutFinancial.supplyContractCurrency().select('USD');
    contractAboutFinancial.supplyContractConversionRateToGBP().type('1.123456');

    const today = new Date();
    contractAboutFinancial.supplyContractConversionDate().day().type(`${today.getDate()}`);
    contractAboutFinancial.supplyContractConversionDate().month().type(`${today.getMonth() + 1}`);
    contractAboutFinancial.supplyContractConversionDate().year().type(`${today.getFullYear()}`);

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

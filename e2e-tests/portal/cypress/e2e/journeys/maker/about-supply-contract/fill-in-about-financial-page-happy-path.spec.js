const {
  contract, contractAboutFinancial, contractAboutPreview, defaults,
} = require('../../../pages');
const partials = require('../../../partials');
const MOCK_USERS = require('../../../../fixtures/users');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    console.info(JSON.stringify(aDealWithAboutBuyerComplete, null, 4));
    cy.insertOneDeal(aDealWithAboutBuyerComplete, BANK1_MAKER1)
      .then((insertedDeal) => {
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

    cy.title().should('eq', `Financial information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    // prove the exchange-rate fields start hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    // prove the exchange-rate fields stay hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    contractAboutFinancial.saveAndGoBack().click();

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');

    partials.taskListHeader.itemStatus('financial-information').invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });

    // since we've cleared all validation at this point the section should show as completed on the deal page
    contract.visit(deal);
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });
  });
});

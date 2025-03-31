const { CURRENCY } = require('@ukef/dtfs2-common');
const { contract, contractAboutFinancial, contractAboutPreview, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let bssDealId;
  let contractUrl;
  const additionalRefName = 'UKEF test bank (Delegated)';

  before(() => {
    console.info(JSON.stringify(aDealWithAboutBuyerComplete, null, 4));
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeBssEwcsDealandFillDealFields({
      exporterCompanyName: 'Exporter Company Name',
    });
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    cy.visit(contractUrl);
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    cy.title().should('eq', `Financial information - ${additionalRefName}${defaults.pageTitleAppend}`);

    // prove the exchange-rate fields start hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    cy.keyboardInput(contractAboutFinancial.supplyContractValue(), '10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select(CURRENCY.GBP);

    // prove the exchange-rate fields stay hidden..
    contractAboutFinancial.supplyContractConversionRateToGBP().should('not.be.visible');

    contractAboutFinancial.saveAndGoBack().click();

    // check that the preview page renders the Submission Details component
    cy.visit(`${contractUrl}/about/check-your-answers`);
    contractAboutPreview.submissionDetails().should('be.visible');

    cy.assertText(partials.taskListHeader.itemStatus('financial-information'), 'Completed');

    // since we've cleared all validation at this point the section should show as completed on the deal page
    cy.visit(contractUrl);

    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Completed');
  });
});

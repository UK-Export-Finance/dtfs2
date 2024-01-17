const { contract, contractAboutFinancial, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Financial page form - create element and check if inserted into deal', () => {
  let deal;

  before(() => {
    console.info(JSON.stringify(aDealWithAboutBuyerComplete, null, 4));
    cy.insertOneDeal(aDealWithAboutBuyerComplete, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it("should not insert created element's data into the deal", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page; use the nav so we have it covered in a test..
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    cy.title().should('eq', `Financial information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    cy.insertElement('financial-form');

    contractAboutFinancial.preview().click();

    cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
      // ensure the updated deal does not contain additional intruder field
      expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    });
  });
});

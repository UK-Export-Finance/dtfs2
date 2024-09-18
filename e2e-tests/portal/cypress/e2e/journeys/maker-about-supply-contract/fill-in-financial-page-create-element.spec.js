const { contract, contractAboutFinancial, defaults } = require('../../pages');
const partials = require('../../partials');
const { additionalRefName } = require('../../../fixtures/deal');

context('Financial page form - create element and check if inserted into deal', () => {
  before(() => {
    cy.createBssDeal({});
  });

  it("should not insert created element's data into the deal", () => {
    contract.aboutSupplierDetailsLink().click();

    partials.taskListHeader.itemLink('buyer').click();
    partials.taskListHeader.itemLink('financial-information').click();

    cy.title().should('eq', `Financial information - ${additionalRefName}${defaults.pageTitleAppend}`);

    // set a GBP value, so we don't need to fill in the exchange-rate fields
    contractAboutFinancial.supplyContractValue().type('10000');
    contractAboutFinancial.supplyContractValue().should('have.value', '10,000');

    contractAboutFinancial.supplyContractCurrency().select('GBP');

    cy.insertElement('financial-form');

    contractAboutFinancial.preview().click();

    // TODO
    // cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
    //   // ensure the updated deal does not contain additional intruder field
    //   expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    // });
  });
});

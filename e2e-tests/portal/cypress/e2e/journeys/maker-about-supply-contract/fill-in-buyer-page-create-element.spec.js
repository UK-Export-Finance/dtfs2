const { contract, contractAboutSupplier, contractAboutBuyer, defaults } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Buyer form - create element and check if inserted into deal', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it("should not insert created element's data in the deal", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    cy.title().should('eq', `Buyer information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    // fill in the fields
    cy.keyboardInput(contractAboutBuyer.buyerName(), 'Harry Bear');
    contractAboutBuyer.buyerAddress().country().select('USA');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Corner of East and Main');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'The Bronx');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'New York');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'no-idea');

    contractAboutBuyer.destinationOfGoodsAndServices().select('USA');

    cy.insertElement('buyer-name-div');

    // save
    contractAboutBuyer.nextPage().click();

    cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
      // ensure the updated deal does not contain additional intruder field
      expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    });
  });
});

const { contract, contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../fixtures/deal');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  before(() => {
    cy.createBssEwcsDeal();
  });

  it('A maker picks up a deal and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    cy.title().should('eq', `Buyer information - ${additionalRefName}${defaults.pageTitleAppend}`);

    // fill in the fields
    cy.keyboardInput(contractAboutBuyer.buyerName(), 'Harry Bear');
    contractAboutBuyer.buyerAddress().country().select('USA');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Corner of East and Main');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'The Bronx');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'New York');
    cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'no-idea');

    contractAboutBuyer.destinationOfGoodsAndServices().select('USA');

    // save
    contractAboutBuyer.saveAndGoBack().click();

    // check that the preview page renders the Submission Details component
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    cy.assertText(partials.taskListHeader.itemStatus('buyer'), 'Completed');
  });
});

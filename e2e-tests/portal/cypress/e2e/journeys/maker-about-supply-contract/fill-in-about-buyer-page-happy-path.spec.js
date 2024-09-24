const { contract, contractAboutSupplier, contractAboutBuyer, dashboardDeals } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  before(() => {
    cy.createBssEwcsDeal({});
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

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
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();

    cy.assertText(partials.taskListHeader.itemStatus('buyer'), 'Completed');
  });
});

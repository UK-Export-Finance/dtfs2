const { contract, contractAboutSupplier, contractAboutBuyer, dashboardDeals } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Buyer form - create element and check if inserted into deal', () => {
  before(() => {
    cy.createBssDeal({});
  });

  it("should not insert created element's data in the deal", () => {
    cy.login(BANK1_MAKER1);
    // navigate to the about-buyer page
    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    // fill in the fields
    contractAboutBuyer.buyerName().type('Harry Bear');
    contractAboutBuyer.buyerAddress().country().select('USA');
    contractAboutBuyer.buyerAddress().line1().type('Corner of East and Main');
    contractAboutBuyer.buyerAddress().line3().type('The Bronx');
    contractAboutBuyer.buyerAddress().town().type('New York');
    contractAboutBuyer.buyerAddress().postcode().type('no-idea');

    contractAboutBuyer.destinationOfGoodsAndServices().select('USA');

    cy.insertElement('buyer-name-div');

    // save
    contractAboutBuyer.nextPage().click();
  });
});

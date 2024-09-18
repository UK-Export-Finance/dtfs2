const { contract, contractAboutSupplier, contractAboutBuyer, defaults } = require('../../pages');
const { additionalRefName } = require('../../../fixtures/deal');

context('Buyer form - create element and check if inserted into deal', () => {
  before(() => {
    cy.createBssDeal({});
  });

  it("should not insert created element's data in the deal", () => {
    // navigate to the about-buyer page
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    cy.title().should('eq', `Buyer information - ${additionalRefName}${defaults.pageTitleAppend}`);

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

    // TODO
    // cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
    //   // ensure the updated deal does not contain additional intruder field
    //   expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    // });
  });
});

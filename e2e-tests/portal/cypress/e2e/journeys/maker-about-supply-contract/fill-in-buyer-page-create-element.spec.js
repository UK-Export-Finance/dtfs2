const { contract, contractAboutSupplier, contractAboutBuyer, defaults } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Buyer form - create element and check if inserted into deal', () => {
  let bssDealId;
  let contractUrl;
  const additionalRefName = 'UKEF test bank (Delegated)';

  before(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeAboutSupplierSection({
      exporterCompanyName: 'Exporter Company Name',
    });
  });

  it("should not insert created element's data in the deal", () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page
    cy.visit(contractUrl);
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

    cy.insertElement('buyer-name-div');

    // save
    contractAboutBuyer.nextPage().click();

    cy.getDeal(bssDealId, BANK1_MAKER1).then((updatedDeal) => {
      // ensure the updated deal does not contain additional intruder field
      expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    });
  });
});

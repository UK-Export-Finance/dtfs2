const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutPreview, defaults,
} = require('../../../pages');
const partials = require('../../../partials');
const MOCK_USERS = require('../../../../fixtures/users');
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // navigate to the about-buyer page
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    cy.title().should('eq', `Buyer information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    // fill in the fields
    contractAboutBuyer.buyerName().type('Huggy Bear');
    contractAboutBuyer.buyerAddress().country().select('USA');
    contractAboutBuyer.buyerAddress().line1().type('Corner of East and Main');
    contractAboutBuyer.buyerAddress().line3().type('The Bronx');
    contractAboutBuyer.buyerAddress().town().type('New York');
    contractAboutBuyer.buyerAddress().postcode().type('no-idea');

    contractAboutBuyer.destinationOfGoodsAndServices().select('USA');

    // save
    contractAboutBuyer.saveAndGoBack().click();

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');

    partials.taskListHeader.itemStatus('buyer').invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });
  });
});

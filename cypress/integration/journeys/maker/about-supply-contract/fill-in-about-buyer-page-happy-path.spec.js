const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutPreview, defaults,
} = require('../../../pages');

const maker1 = { username: 'MAKER', password: 'MAKER' };

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, { ...maker1 })
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login({ ...maker1 });

    // navigate to the about-buyer page
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    cy.title().should('eq', `Buyer information - ${deal.details.bankSupplyContractName}${defaults.pageTitleAppend}`);

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

    contractAboutPreview.nav().aboutBuyerComplete().should('exist');
  });
});

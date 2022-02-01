const {
  contract, contractAboutSupplier, contractAboutBuyer, contractAboutPreview, defaults,
} = require('../../../pages');
const partials = require('../../../partials');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login(MAKER_LOGIN);

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

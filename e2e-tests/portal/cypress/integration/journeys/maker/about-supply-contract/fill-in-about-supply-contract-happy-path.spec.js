const {
  contract, contractAboutSupplier, contractAboutPreview, defaults,
} = require('../../../pages');
const partials = require('../../../partials');
const MOCK_USERS = require('../../../../fixtures/users');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

context('about-supply-contract', () => {
  let deal;

  before(() => {
    const aDealWithAboutSupplyContractInStatus = (status) => {
      const candidates = twentyOneDeals
        .filter((aDeal) => (aDeal.submissionDetails && status === aDeal.submissionDetails.status)
          && (aDeal.status === 'Draft')
          && (!aDeal.details || !aDeal.details.submissionDate));

      const aDeal = candidates[0];
      if (!aDeal) {
        throw new Error('no suitable test data found');
      } else {
        return aDeal;
      }
    };

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractInStatus('Not started'), BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not started');
    });
    contract.aboutSupplierDetailsLink().click();

    cy.title().should('eq', `Supplier information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    //---
    // check initial page state..
    //---

    // sections of the page that start hidden should be hidden
    contractAboutSupplier.supplierCorrespondenceAddress().line1().should('be.hidden');
    contractAboutSupplier.indemnifierName().should('be.hidden');
    // default values should be in place
    contractAboutSupplier.supplierAddress().country().should('have.value', '');
    contractAboutSupplier.errors().should('not.exist');

    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('08547313');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // // the search should populate the supplier address fields
    contractAboutSupplier.supplierName().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().line1().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().town().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().postcode().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().country().should('have.value', 'GBR');

    //---
    // fill in the simplest version of the form so we can submit it and save it..
    //---
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('1009'); // Information and communication
    contractAboutSupplier.industryClass().should('have.value', '');
    contractAboutSupplier.industryClass().select('62012'); // Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();
    contractAboutSupplier.supplyContractDescription().type('Typing in tests takes time.');
    contractAboutSupplier.notLegallyDistinct().click();

    contractAboutSupplier.saveAndGoBack().click();

    // the deal page should reflect the partially-complete nature of the section
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');

    partials.taskListHeader.itemStatus('supplier-and-counter-indemnifier/guarantor').invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });
  });
});

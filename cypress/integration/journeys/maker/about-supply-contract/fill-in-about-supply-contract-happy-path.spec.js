const {
  contract, contractAboutSupplier, contractAboutPreview, defaults,
} = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

// test data we want to set up + work with..
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

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
    const aDealWith_AboutSupplyContract_InStatus = (status) => {
      const candidates = twentyOneDeals
        .filter((deal) => (deal.submissionDetails && status === deal.submissionDetails.status))
        .filter((deal) => (deal.details && deal.details.status === 'Draft'))
        .filter((deal) => (deal.details && !deal.details.submissionDate));

      const deal = candidates[0];
      if (!deal) {
        throw new Error('no suitable test data found');
      } else {
        return deal;
      }
    };

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWith_AboutSupplyContract_InStatus('Not Started'), MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    cy.login(MAKER_LOGIN);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not Started');
    });
    contract.aboutSupplierDetailsLink().click();

    cy.title().should('eq', `Supplier information - ${deal.details.bankSupplyContractName}${defaults.pageTitleAppend}`);

    //---
    // check initial page state..
    //---

    // sections of the page that start hidden should be hidden
    contractAboutSupplier.supplierCorrespondenceAddress().line1().should('be.hidden');
    contractAboutSupplier.indemnifierName().should('be.hidden');
    // default values should be in place
    contractAboutSupplier.supplierAddress().country().should('have.value', 'GBR');
    contractAboutSupplier.errors().should('not.exist');

    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('08547313'); // TODO better test company?
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // // the search should populate the supplier address fields
    // contractAboutSupplier.supplierAddressCountry().should('?', '?'); //TODO country; mapping company house "england"-> portal "United Kingdom"
    contractAboutSupplier.supplierName().should('not.have.value', ''); // TODO if we had 'proper' test company we might assert real data
    contractAboutSupplier.supplierAddress().line1().should('not.have.value', ''); // TODO
    contractAboutSupplier.supplierAddress().town().should('not.have.value', ''); // TODO
    contractAboutSupplier.supplierAddress().postcode().should('not.have.value', ''); // TODO
    contractAboutSupplier.supplierAddress().country().should('not.have.value', ''); // TODO
    // TODO: industry sector is populated from companise house data / should not be 'Please select'
    // TODO: industry class is populated from companise house data / should not be 'Please select'

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

    contractAboutPreview.nav().aboutSupplierComplete().should('exist');
  });
});

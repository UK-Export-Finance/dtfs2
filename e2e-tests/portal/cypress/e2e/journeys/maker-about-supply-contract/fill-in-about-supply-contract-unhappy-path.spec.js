const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier, contractAboutPreview } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    const aDealWithAboutSupplyContractInStatus = (status) => {
      const candidates = twentyOneDeals.filter(
        (aDeal) =>
          aDeal.submissionDetails && status === aDeal.submissionDetails.status && aDeal.status === 'Draft' && (!aDeal.details || !aDeal.details.submissionDate),
      );

      const aDeal = candidates[0];
      if (!aDeal) {
        throw new Error('no suitable test data found');
      } else {
        return aDeal;
      }
    };

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractInStatus('Incomplete'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, selecting every option that requires more data.', () => {
    cy.login(BANK1_MAKER1);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);
    // check the status is displaying correctly
    contract
      .aboutSupplierDetailsStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('Incomplete');
      });
    contract.aboutSupplierDetailsLink().click();

    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierName().clear().type('UKEF');
    contractAboutSupplier.supplierAddress().country().select('GBR');
    contractAboutSupplier.supplierAddress().line1().type('1 Horseguards Road');
    contractAboutSupplier.supplierAddress().line3().type('Westminster');
    contractAboutSupplier.supplierAddress().town().type('London');
    contractAboutSupplier.supplierAddress().postcode().type('SW1A 2HQ');

    //-----
    // select a different correspondence address so we are forced to fill it in
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    // check default state
    contractAboutSupplier.supplierCorrespondenceAddress().country().should('have.value', '');
    // fill in form..
    contractAboutSupplier.supplierCorrespondenceAddress().line1().type('2 Horseguards Road');
    contractAboutSupplier.supplierCorrespondenceAddress().line3().type('Eastminster');
    contractAboutSupplier.supplierCorrespondenceAddress().town().type('Edinburgh');
    contractAboutSupplier.supplierCorrespondenceAddress().postcode().type('ED1 23S');
    contractAboutSupplier.industrySector().select('1009'); // Information and communication
    contractAboutSupplier.industryClass().select('62012'); // Business and domestic software development
    contractAboutSupplier.smeTypeSmall().click();
    contractAboutSupplier.supplyContractDescription().type('Description.');

    //-----
    // select a legally-distinct indemnifier
    contractAboutSupplier.legallyDistinct().click();
    // check default state
    contractAboutSupplier.indemnifierAddress().country().should('have.value', '');

    //-----
    // use the companies house search to find the indemnifier
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    //------
    // the search should populate the indemnifier address fields
    //
    contractAboutSupplier.indemnifierName().should('not.have.value', '');
    contractAboutSupplier.indemnifierAddress().line1().should('not.have.value', '');
    contractAboutSupplier.indemnifierAddress().town().should('not.have.value', '');
    contractAboutSupplier.indemnifierAddress().postcode().should('not.have.value', '');
    contractAboutSupplier.indemnifierAddress().country().should('have.value', 'GBR');

    //-----
    // continue filling in the form..
    // confirm that the indemnifier correspondence address is hidden until we click the radio-button...
    contractAboutSupplier.indemnifierCorrespondenceAddress().line1().should('not.be.visible');
    // select a different correspondence address for the indemnifier..
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    // check default state
    contractAboutSupplier.indemnifierCorrespondenceAddress().country().should('have.value', '');
    // fill in form
    contractAboutSupplier.indemnifierCorrespondenceAddress().line1().type('Test address');
    contractAboutSupplier.indemnifierCorrespondenceAddress().line3().type('Broomfield');
    contractAboutSupplier.indemnifierCorrespondenceAddress().town().type('Chelmsford');
    contractAboutSupplier.indemnifierCorrespondenceAddress().postcode().type('SW1A 2HQ');

    contractAboutSupplier.saveAndGoBack().click();

    contract
      .aboutSupplierDetailsStatus()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('Incomplete');
      });

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');
  });
});

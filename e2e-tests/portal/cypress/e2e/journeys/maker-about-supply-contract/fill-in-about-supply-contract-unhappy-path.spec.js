const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier, contractAboutPreview, dashboardDeals, contractAboutBuyer, contractAboutFinancial } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('about-supply-contract', () => {
  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, selecting every option that requires more data.', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    // check the status is displaying correctly
    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Not started');

    contract.aboutSupplierDetailsLink().click();

    contractAboutSupplier.supplierType().select('Exporter');

    cy.keyboardInput(contractAboutSupplier.supplierName().clear(), 'UKEF');

    contractAboutSupplier.supplierAddress().country().select('GBR');

    cy.keyboardInput(contractAboutSupplier.supplierAddress().line1(), '1 Horseguards Road');

    cy.keyboardInput(contractAboutSupplier.supplierAddress().line3(), 'Westminster');

    cy.keyboardInput(contractAboutSupplier.supplierAddress().town(), 'London');

    cy.keyboardInput(contractAboutSupplier.supplierAddress().postcode(), 'SW1A 2HQ');

    //-----
    // select a different correspondence address so we are forced to fill it in
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    // check default state
    contractAboutSupplier.supplierCorrespondenceAddress().country().should('have.value', '');

    // fill in form
    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().line1(), '2 Horseguards Road');

    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().line3(), 'Eastminster');

    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().town(), 'Edinburgh');

    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().postcode(), 'ED1 23S');

    contractAboutSupplier.industrySector().select('1009'); // Information and communication
    contractAboutSupplier.industryClass().select('62012'); // Business and domestic software development
    contractAboutSupplier.smeTypeSmall().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Description');

    //-----
    // select a legally-distinct indemnifier
    contractAboutSupplier.legallyDistinct().click();
    // check default state
    contractAboutSupplier.indemnifierAddress().country().should('have.value', '');

    //-----
    // use the companies house search to find the indemnifier
    cy.keyboardInput(contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);

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
    cy.keyboardInput(contractAboutSupplier.indemnifierCorrespondenceAddress().line1(), 'Test address');

    cy.keyboardInput(contractAboutSupplier.indemnifierCorrespondenceAddress().line3(), 'Broomfield');

    cy.keyboardInput(contractAboutSupplier.indemnifierCorrespondenceAddress().town(), 'Chelmsford');

    cy.keyboardInput(contractAboutSupplier.indemnifierCorrespondenceAddress().postcode(), 'SW1A 2HQ');

    contractAboutSupplier.saveAndGoBack().click();

    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Incomplete');

    // check that the preview page renders the Submission Details component
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.submissionDetails().should('be.visible');
  });
});

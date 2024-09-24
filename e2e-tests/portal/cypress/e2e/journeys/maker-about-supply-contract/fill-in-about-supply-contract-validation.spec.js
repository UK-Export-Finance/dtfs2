const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview, dashboardDeals, contract } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierName().clear();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    partials.errorSummaryLinks().should('have.length', 18);

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supplier type is required');
    contractAboutPreview.expectError('Supplier name is required');
    contractAboutPreview.expectError('Supplier address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address is required');
    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');

    // prove the errors are on the about-supplier page
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.expectError('Supplier type is required');
    contractAboutSupplier.expectError('Supplier name is required');
    contractAboutSupplier.expectError('Supplier address line 1 is required');
    contractAboutSupplier.expectError('Supplier correspondence address is required');
    contractAboutSupplier.expectError('Industry Sector is required');
    contractAboutSupplier.expectError('Industry Class is required');
    contractAboutSupplier.expectError('SME type is required');
    contractAboutSupplier.expectError('Supplier town is required for non-UK addresses');

    // switch to UK country
    contractAboutSupplier.supplierAddress().country().select('GBR');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    // open up the correspondence address to generate more errors..
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('GBR');
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    // prove the errors show on the preview page
    contractAboutPreview.expectError('Supplier postcode is required for UK addresses');
    contractAboutPreview.expectError('Supplier correspondence postcode is required for UK addresses');

    // prove the errors show on the about-supplier page
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.expectError('Supplier postcode is required for UK addresses');
    contractAboutSupplier.expectError('Supplier correspondence postcode is required for UK addresses');

    // switch to non-UK country
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Supplier correspondence postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Supplier correspondence town is required for non-UK addresses');

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    // open up the legally-distinct indemnifier section to generate more errors...
    contractAboutSupplier.legallyDistinct().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier name is required');
    contractAboutPreview.expectError('Indemnifier address line 1 is required');

    // prove the errors show on the about-supplier page
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.expectError('Indemnifier address line 1 is require');

    // switch to non-UK country
    contractAboutSupplier.indemnifierAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Indemnifier postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Indemnifier town is required for non-UK addresses');

    // open up the indemnifier correspondence address section to generate more errors...
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier correspondence address line 1 is required');

    // prove the errors show on the about-supplier page
    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.expectError('Indemnifier correspondence address line 1 is required');

    // switch to non-UK country
    contractAboutSupplier.indemnifierCorrespondenceAddress().country().select('USA');
    // click through
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.errors().should('not.contain', 'Indemnifier correspondence postcode is required for UK addresses');
    contractAboutPreview.errors().should('contain', 'Indemnifier correspondence town is required for non-UK addresses');
  });

  it('A maker picks up a deal in status=Draft, triggers Supplier companies house validation errors', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    //---------------------------------------------------------------
    // supplier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/about/supplier');

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a Companies House registration number');

    //---------------------------------------------------------------
    // supplier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('A maker picks up a deal in status=Draft, fills in a field, triggers Supplier companies house validation errors', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    //---------------------------------------------------------------
    // fill in at least one form field unrelated to Companies House
    //---------------------------------------------------------------
    contractAboutSupplier.supplierType().select('Exporter');

    //---------------------------------------------------------------
    // supplier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // the unrelated form field we provided earlier should be populated
    contractAboutSupplier.supplierType().find(':selected').should('have.value', 'Exporter');

    // companies house input value should be retained
    contractAboutSupplier
      .supplierCompaniesHouseRegistrationNumber()
      .invoke('val')
      .then((value) => {
        expect(value).equal(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);
      });

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('A maker picks up a deal in status=Draft, triggers Indemnifier companies house validation errors', () => {
    cy.login(BANK1_MAKER1);
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();

    //---------------------------------------------------------------
    // indemnifier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a Companies House registration number');

    //---------------------------------------------------------------
    // indemnifier companies house submit - providing a value which is too short
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    cy.keyboardInput(contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which is too short
    //---------------------------------------------------------------------------

    cy.keyboardInput(contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT);

    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which has a special character
    //---------------------------------------------------------------------------------------

    cy.keyboardInput(
      contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear(),
      MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPECIAL_CHARACTER,
    );

    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //--------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which has a space
    //--------------------------------------------------------------------------

    cy.keyboardInput(contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPACE);

    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    // should see companies house validation errors
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // companies house input value should be retained
    contractAboutSupplier
      .indemnifierCompaniesHouseRegistrationNumber()
      .invoke('val')
      .then((value) => {
        expect(value).equal(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPACE);
      });

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    contractAboutSupplier.legallyDistinct().click();
    cy.keyboardInput(contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();
    partials.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('trigger just Supplier companies house validation error', () => {
    cy.login(BANK1_MAKER1);
    cy.visit('/dashboard');
    // Select "Create new" and choose "Bond Support" as the scheme type
    cy.get('[data-cy="CreateNewSubmission"]').click();
    cy.get('[data-cy="scheme-bss"]').click();
    cy.get('[data-cy="continue-button"]').click();
    cy.get('[data-cy="criteriaMet-true"]').click();
    cy.clickSubmitButton();

    cy.keyboardInput(cy.get('[data-cy="bankInternalRefName"]'), 'TestBank1903');
    cy.keyboardInput(cy.get('[data-cy="additionalRefName"]'), 'TestBank1903');
    cy.clickSubmitButton();

    // Click on "View Details" under the "About the Supplier" contract
    cy.get('[data-cy="ViewAboutSupplierDetails"]').click();

    //---------------------------------------------------------------------------
    // Invalid Companies House registration number
    //---------------------------------------------------------------------------

    // Enter an invalid Companies House registration number
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------------------
    // Empty Companies House registration number
    //---------------------------------------------------------------------------

    // Enter an empty Companies House registration number
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().clear();

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a Companies House registration number');

    //---------------------------------------------------------------------------
    // Valid but non-existent Companies House registration number
    //---------------------------------------------------------------------------

    // Enter a valid but non-existent Companies House registration number
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_NONEXISTENT);

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('No company matching the Companies House registration number entered was found');

    //---------------------------------------------------------------------------
    // Valid Companies House registration number for an overseas company
    //---------------------------------------------------------------------------

    // Enter a valid Companies House registration number for an overseas company
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_OVERSEAS);

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('UKEF can only process applications from companies based in the UK');
  });

  it('A maker picks up a deal in status=Draft, misses mandatory field then trigger missed validation error.', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    // click through
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierName(), 'test');
    cy.keyboardInput(contractAboutSupplier.supplierAddress().line1(), 'test');
    cy.keyboardInput(contractAboutSupplier.supplierAddress().town(), 'test');
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().line1(), 'test');
    cy.keyboardInput(contractAboutSupplier.supplierCorrespondenceAddress().town(), 'test');
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('GBR');
    contractAboutSupplier.industrySector().select('Education');
    contractAboutSupplier.industryClass().select('Cultural education');
    contractAboutSupplier.smeTypeMicro().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'test');
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.nextPage().click();
    // re-visit supplier page
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    // should display missed validation errors, returns 6 errors
    partials.errorSummaryLinks().should('have.length', 6);
    contractAboutSupplier.expectError('Supplier country is required');
    contractAboutSupplier.expectError('Supplier correspondence postcode is required for UK addresses');
  });
});

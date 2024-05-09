const {
  contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    const aDealWithAboutSupplyContractInStatus = (status) => {
      const candidates = twentyOneDeals
        .filter((aDeal) => (aDeal.submissionDetails && status === aDeal.submissionDetails.status)
        && aDeal.status === 'Draft');

      const aDeal = candidates[0];
      if (!aDeal) {
        throw new Error('no suitable test data found');
      } else {
        return aDeal;
      }
    };

    cy.insertOneDeal(aDealWithAboutSupplyContractInStatus('Incomplete'), BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = insertedDeal._id;
      });
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(BANK1_MAKER1);

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.supplierName().clear();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    partials.errorSummary.errorSummaryLinks().should('have.length', 18);

    // prove validation of all non-conditional pieces
    contractAboutPreview.expectError('Supplier type is required');
    contractAboutPreview.expectError('Supplier name is required');
    contractAboutPreview.expectError('Supplier address line 1 is required');
    contractAboutPreview.expectError('Supplier correspondence address is required');
    contractAboutPreview.expectError('Industry Sector is required');
    contractAboutPreview.expectError('Industry Class is required');
    contractAboutPreview.expectError('SME type is required');

    // prove the errors are on the about-supplier page
    contractAboutSupplier.visit(deal);
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

    contractAboutSupplier.visit(deal);
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
    contractAboutSupplier.visit(deal);
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

    contractAboutSupplier.visit(deal);
    // open up the legally-distinct indemnifier section to generate more errors...
    contractAboutSupplier.legallyDistinct().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier name is required');
    contractAboutPreview.expectError('Indemnifier address line 1 is required');

    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
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
    contractAboutSupplier.visit(deal);
    contractAboutSupplier.indemnifierCorrespondenceAddressDifferent().click();
    // save + skip ahead to the preview
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.expectError('Indemnifier correspondence address line 1 is required');

    // prove the errors show on the about-supplier page
    contractAboutSupplier.visit(deal);
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
    contractAboutSupplier.visit(deal);

    //---------------------------------------------------------------
    // supplier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------
    // supplier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('A maker picks up a deal in status=Draft, fills in a field, triggers Supplier companies house validation errors', () => {
    cy.login(BANK1_MAKER1);
    contractAboutSupplier.visit(deal);

    //---------------------------------------------------------------
    // fill in at least one form field unrelated to Companies House
    //---------------------------------------------------------------
    contractAboutSupplier.supplierType().select('Exporter');

    //---------------------------------------------------------------
    // supplier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // the unrelated form field we provided earlier should be populated
    contractAboutSupplier.supplierType().find(':selected').should('have.value', 'Exporter');

    // companies house input value should be retained
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().invoke('val').then((value) => {
      expect(value).equal('TEST');
    });

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('A maker picks up a deal in status=Draft, triggers Indemnifier companies house validation errors', () => {
    cy.login(BANK1_MAKER1);
    contractAboutSupplier.visit(deal);

    //---------------------------------------------------------------
    // indemnifier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------
    // indemnifier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which is too short
    //---------------------------------------------------------------------------

    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear().type('89898');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //---------------------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which has a special character
    //---------------------------------------------------------------------------------------

    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear().type('R$00592C');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    //--------------------------------------------------------------------------
    // indemnifier companies house submit - providing a value which has a space
    //--------------------------------------------------------------------------

    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().clear().type('8989898 ');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // companies house input value should be retained
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().invoke('val').then((value) => {
      expect(value).equal('8989898 ');
    });

    //---------------------------------------------------------------
    // viewing the `Check your answers` page and then re-visiting the About Supplier page
    //---------------------------------------------------------------
    // should display all required validation errors
    partials.taskListHeader.checkYourAnswersLink().click();
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 11);

    // triggering companies house error should then display companies house & required validation errors
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
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
    cy.get('[data-cy="submit-button"]').click();
    cy.get('[data-cy="bankInternalRefName"]').type('TestBank1903');
    cy.get('[data-cy="additionalRefName"]').type('TestBank1903');
    cy.get('[data-cy="submit-button"]').click();

    // Click on "View Details" under the "About the Supplier" contract
    cy.get('[data-cy="ViewAboutSupplierDetails"]').click();

    // Enter an invalid Companies House registration number
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // Enter an empty Companies House registration number
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().clear();

    // Click on Search
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // Check that the correct validation error is displayed
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });

  it('A maker picks up a deal in status=Draft, misses mandatory field then trigger missed validation error.', () => {
    cy.login(BANK1_MAKER1);

    contractAboutSupplier.visit(deal);
    // click through
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierName().type('test');
    contractAboutSupplier.supplierAddress().line1().type('test');
    contractAboutSupplier.supplierAddress().town().type('test');
    contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();
    contractAboutSupplier.supplierCorrespondenceAddress().line1().type('test');
    contractAboutSupplier.supplierCorrespondenceAddress().town().type('test');
    contractAboutSupplier.supplierCorrespondenceAddress().country().select('GBR');
    contractAboutSupplier.industrySector().select('Education');
    contractAboutSupplier.industryClass().select('Cultural education');
    contractAboutSupplier.smeTypeMicro().click();
    contractAboutSupplier.supplyContractDescription().type('test');
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.nextPage().click();
    // re-visit supplier page
    partials.taskListHeader.itemLink('supplier-and-counter-indemnifier/guarantor').click();
    // should display missed validation errors, returns 6 errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 6);
    contractAboutSupplier.expectError('Supplier country is required');
    contractAboutSupplier.expectError('Supplier correspondence postcode is required for UK addresses');
  });
});

const {
  contractAboutSupplier, contractAboutBuyer, contractAboutFinancial, contractAboutPreview,
} = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
// test data we want to set up + work with..
const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('about-supply-contract', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.deleteDeals(MAKER_LOGIN);

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

    cy.insertOneDeal(aDealWithAboutSupplyContractInStatus('Incomplete'), MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = insertedDeal._id;
      });
  });

  it('A maker picks up a deal in status=Draft, and triggers all validation errors.', () => {
    cy.login(MAKER_LOGIN);

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
    cy.login(MAKER_LOGIN);
    contractAboutSupplier.visit(deal);

    //---------------------------------------------------------------
    // supplier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should only see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a Companies House registration number');

    //---------------------------------------------------------------
    // supplier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should only see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
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
    cy.login(MAKER_LOGIN);
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

    // should only see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
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
    cy.login(MAKER_LOGIN);
    contractAboutSupplier.visit(deal);

    //---------------------------------------------------------------
    // indemnifier companies house submit - without providing a value
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should only see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a Companies House registration number');

    //---------------------------------------------------------------
    // indemnifier companies house submit - providing an invalid value
    //---------------------------------------------------------------
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();

    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));

    // should only see companies house validation errors
    partials.errorSummary.errorSummaryLinks().should('have.length', 1);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');

    // companies house input value should be retained
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().invoke('val').then((value) => {
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
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCompaniesHouseRegistrationNumber().type('TEST');
    contractAboutSupplier.indemnifierSearchCompaniesHouse().click();
    partials.errorSummary.errorSummaryLinks().should('have.length', 12);
    contractAboutSupplier.expectError('Enter a valid Companies House registration number');
  });
});

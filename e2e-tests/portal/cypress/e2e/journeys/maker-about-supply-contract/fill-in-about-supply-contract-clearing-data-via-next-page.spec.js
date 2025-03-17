const { contractAboutSupplier, contractAboutPreview, dashboardDeals, contract, contractAboutBuyer, contractAboutFinancial } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('A maker picks up a deal with every field filled in and starts deselecting "separate indemnifier correspondence address" etc.', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal();
  });

  beforeEach(() => {
    cy.loginGoToDealPage(BANK1_MAKER1);
  });

  it('should clear indemnifier correspondence address fields when deselecting separate address', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.nextPage().click();

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    ['line1', 'line2', 'town', 'line3', 'postcode', 'country'].forEach((field) => {
      contractAboutPreview.indemnifierCorrespondenceAddress()[field]().should('not.exist');
    });
  });

  it('should clear indemnifier details when selecting "not legally distinct"', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.nextPage().click();

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');

    ['line1', 'line2', 'town', 'line3', 'postcode', 'country'].forEach((field) => {
      contractAboutPreview.indemnifierAddress()[field]().should('not.exist');
    });

    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');
  });

  it('should clear supplier correspondence address fields when selecting same address', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.nextPage().click();

    dashboardDeals.visit();
    cy.clickDashboardDealLink();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    ['line1', 'line2', 'town', 'line3', 'postcode', 'country'].forEach((field) => {
      contractAboutPreview.supplierCorrespondenceAddress()[field]().should('not.exist');
    });
  });
});

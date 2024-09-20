const { contractAboutSupplier, contractAboutPreview, dashboardDeals, contract, contractAboutBuyer, contractAboutFinancial } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});
  });

  it('A maker picks up a deal with every field filled in and starts deselecting "separate indemnifier correspondence address" etc.', () => {
    cy.login(BANK1_MAKER1);

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.indemnifierCorrespondenceAddressNotDifferent().click({ force: true });
    contractAboutSupplier.saveAndGoBack().click();

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.indemnifierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().country().should('not.exist');

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.saveAndGoBack().click();

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');
    contractAboutPreview.indemnifierAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierAddress().town().should('not.exist');
    contractAboutPreview.indemnifierAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierAddress().country().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.saveAndGoBack().click();

    dashboardDeals.visit();
    dashboardDeals.rowIndex.link().click();
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
    contractAboutPreview.supplierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().country().should('not.exist');
  });
});

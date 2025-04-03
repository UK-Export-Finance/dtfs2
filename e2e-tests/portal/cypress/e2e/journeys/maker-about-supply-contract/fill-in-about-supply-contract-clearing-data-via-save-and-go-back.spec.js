const { contractAboutSupplier, contractAboutPreview } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
    cy.completeAboutSupplierSection({
      exporterCompanyName: 'Exporter Company Name',
    });
  });

  it('A maker picks up a deal with every field filled in and starts deselecting "separate indemnifier correspondence address" etc.', () => {
    cy.login(BANK1_MAKER1);

    contractAboutSupplier.visit(bssDealId);
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCorrespondenceAddressNotDifferent().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(bssDealId);
    contractAboutPreview.indemnifierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().country().should('not.exist');

    contractAboutSupplier.visit(bssDealId);
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(bssDealId);
    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');
    contractAboutPreview.indemnifierAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierAddress().town().should('not.exist');
    contractAboutPreview.indemnifierAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierAddress().country().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');

    contractAboutSupplier.visit(bssDealId);
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(bssDealId);
    contractAboutPreview.supplierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().country().should('not.exist');
  });
});

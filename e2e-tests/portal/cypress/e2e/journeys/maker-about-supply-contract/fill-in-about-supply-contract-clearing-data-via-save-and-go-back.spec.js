const { contractAboutSupplier, contractAboutPreview } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeAboutSupplierSection({
      exporterCompanyName: 'Exporter Company Name',
    });
  });

  it('A maker picks up a deal with every field filled in and starts deselecting "separate indemnifier correspondence address" etc.', () => {
    cy.login(BANK1_MAKER1);

    cy.visit(`${contractUrl}/about/supplier`);
    contractAboutSupplier.legallyDistinct().click();
    contractAboutSupplier.indemnifierCorrespondenceAddressNotDifferent().click();
    contractAboutSupplier.saveAndGoBack().click();

    cy.visit(`${contractUrl}/about/check-your-answers`);
    contractAboutPreview.indemnifierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().country().should('not.exist');

    cy.visit(`${contractUrl}/about/supplier`);
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.saveAndGoBack().click();

    cy.visit(`${contractUrl}/about/check-your-answers`);
    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');
    contractAboutPreview.indemnifierAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierAddress().town().should('not.exist');
    contractAboutPreview.indemnifierAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierAddress().country().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');

    cy.visit(`${contractUrl}/about/supplier`);
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.saveAndGoBack().click();

    cy.visit(`${contractUrl}/about/check-your-answers`);
    contractAboutPreview.supplierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().country().should('not.exist');
  });
});

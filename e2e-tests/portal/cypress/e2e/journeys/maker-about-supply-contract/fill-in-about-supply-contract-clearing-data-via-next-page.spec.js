const { contractAboutSupplier, contractAboutPreview, contract, contractAboutBuyer, contractAboutFinancial } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  beforeEach(() => {
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${bssDealId}`));
  });

  it('should clear indemnifier correspondence address fields when deselecting separate address', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.nextPage().click();

    cy.visit(relative(`/contract/${bssDealId}`));
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

    cy.visit(relative(`/contract/${bssDealId}`));
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

    cy.visit(relative(`/contract/${bssDealId}`));
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();

    ['line1', 'line2', 'town', 'line3', 'postcode', 'country'].forEach((field) => {
      contractAboutPreview.supplierCorrespondenceAddress()[field]().should('not.exist');
    });
  });
});

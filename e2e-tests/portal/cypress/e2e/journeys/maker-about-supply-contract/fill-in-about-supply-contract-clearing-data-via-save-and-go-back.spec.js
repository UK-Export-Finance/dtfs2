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

  // Helper functions
  const navigateToPreview = () => {
    cy.visit(relative(`/contract/${bssDealId}`));
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.preview().click();
  };

  const assertAddressFieldsNotExist = (addressObject) => {
    ['line1', 'line2', 'town', 'line3', 'postcode', 'country'].forEach((field) => {
      addressObject[field]().should('not.exist');
    });
  };

  it('should hide indemnifier correspondence address fields when deselected', () => {
    contract.aboutSupplierDetailsLink().click();
    // Check if the parent div is visible and make it visible if it's not
    cy.get('#additional-form-fields-indemnifier').then(($el) => {
      if ($el.css('display') === 'none') {
        cy.wrap($el).invoke('css', 'display', 'block');
      }
    });
    contractAboutSupplier.indemnifierCorrespondenceAddressNotDifferent().click();
    contractAboutSupplier.saveAndGoBack().click();

    navigateToPreview();

    assertAddressFieldsNotExist(contractAboutPreview.indemnifierCorrespondenceAddress());
  });

  it('should hide indemnifier fields when not legally distinct', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.saveAndGoBack().click();

    navigateToPreview();

    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');
    assertAddressFieldsNotExist(contractAboutPreview.indemnifierAddress());
    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');
  });

  it('should hide supplier correspondence address fields when marked as same', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.saveAndGoBack().click();

    navigateToPreview();

    assertAddressFieldsNotExist(contractAboutPreview.supplierCorrespondenceAddress());
  });
});

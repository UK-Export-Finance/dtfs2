const { COUNTRIES } = require('@ukef/dtfs2-common');
const { contractAboutSupplier, contractAboutBuyer } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

const ALLOWED_COUNTRIES = COUNTRIES.filter((country) => !country?.disabled);
const DISABLED_COUNTRIES = COUNTRIES.filter((country) => country?.disabled);

context('About supply contract - countries', () => {
  let bssDealId;

  before(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  describe('Supplier country dropdown', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);

      contractAboutSupplier.visit(bssDealId);
    });

    it('should display the approved countries in the supplier country dropdown', () => {
      ALLOWED_COUNTRIES.forEach((country) => cy.assertSelectOptionExists(contractAboutSupplier.supplierCountry(), country.name));
    });

    it('should not display the disabled countries in the supplier country dropdown', () => {
      DISABLED_COUNTRIES.forEach((country) => {
        cy.assertSelectOptionDoesNotExist(contractAboutSupplier.supplierCountry(), country.name);
      });
    });

    it('should display the approved countries in the supplier correspondence country dropdown', () => {
      contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();

      ALLOWED_COUNTRIES.forEach((country) => cy.assertSelectOptionExists(contractAboutSupplier.supplierCorrespondenceCountry(), country.name));
    });

    it('should not display the disabled countries in the supplier correspondence country dropdown', () => {
      contractAboutSupplier.supplierCorrespondenceAddressDifferent().click();

      DISABLED_COUNTRIES.forEach((country) => {
        cy.assertSelectOptionDoesNotExist(contractAboutSupplier.supplierCorrespondenceCountry(), country.name);
      });
    });
  });

  describe('Buyer country dropdown', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);

      contractAboutBuyer.visit(bssDealId);
    });

    it('should display the approved countries in the buyer country dropdown', () => {
      ALLOWED_COUNTRIES.forEach((country) => cy.assertSelectOptionExists(contractAboutBuyer.buyerCountry(), country.name));
    });

    it('should not display the disabled countries in the buyer country dropdown', () => {
      DISABLED_COUNTRIES.forEach((country) => {
        cy.assertSelectOptionDoesNotExist(contractAboutBuyer.buyerCountry(), country.name);
      });
    });

    it('should display the approved countries in the destination of goods and services country dropdown', () => {
      ALLOWED_COUNTRIES.forEach((country) => cy.assertSelectOptionExists(contractAboutBuyer.destinationOfGoodsAndServices(), country.name));
    });

    it('should not display the disabled countries in the destination of goods and services country dropdown', () => {
      DISABLED_COUNTRIES.forEach((country) => {
        cy.assertSelectOptionDoesNotExist(contractAboutBuyer.destinationOfGoodsAndServices(), country.name);
      });
    });
  });
});

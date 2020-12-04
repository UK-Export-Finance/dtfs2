const address = require('./address');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/check-your-answers`),

  supplierType: () => cy.get('[data-cy="supplier-type"]'),
  supplierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="supplier-companies-house-registration-number"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
  supplierAddress: () => address('supplier-address'),
  supplierCorrespondenceAddressDifferent: () => cy.get('[data-cy="supplier-correspondence-address-is-different"]'),
  supplierCorrespondenceAddress: () => address('supplier-correspondence-address'),
  industrySector: () => cy.get('[data-cy="industry-sector"]'),
  industryClass: () => cy.get('[data-cy="industry-class"]'),
  smeType: () => cy.get('[data-cy="sme-type"]'),
  supplyContractDescription: () => cy.get('[data-cy="supply-contract-description"]'),
  legallyDistinct: () => cy.get('[data-cy="legallyDistinct"]'),
  indemnifierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="indemnifier-companies-house-registration-number"]'),
  indemnifierName: () => cy.get('[data-cy="indemnifier-name"]'),
  indemnifierAddress: () => address('indemnifier-address'),
  indemnifierCorrespondenceAddressDifferent: () => cy.get('[data-cy="indemnifierCorrespondenceAddressDifferent"]'),
  indemnifierCorrespondenceAddress: () => address('indemnifier-correspondence-address'),

  buyerName: () => cy.get('[data-cy="buyer-name"]'),
  buyerAddress: () => address('buyer-address'),
  destinationOfGoodsAndServices: () => cy.get('[data-cy="destinationOfGoodsAndServices"]'),

  supplyContractValue: () => cy.get('[data-cy="supplyContractValue"]'),
  supplyContractCurrency: () => cy.get('[data-cy="supplyContractCurrency"]'),
  supplyContractConversionRateToGBP: () => cy.get('[data-cy="supplyContractConversionRateToGBP"]'),
  supplyContractConversionDate: () => cy.get('[data-cy="supplyContractConversionDate"]'),

  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-summary__list').contains(text),
  errors: () => cy.get('.govuk-error-summary__list'),
  submissionDetails: () => cy.get('[data-cy="contract-about-submission-details"]'),
};

module.exports = page;

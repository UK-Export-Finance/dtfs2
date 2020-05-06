const address = require('./address');
const nav = require('./nav');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/preview`),
  nav: () => nav,

  supplierType: () => cy.get('[data-cy="supplierType"]'),
  supplierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="supplier-companies-house-registration-number"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
  supplierAddress: () => address('supplier-address'),
  supplierCorrespondenceAddressDifferent: () => cy.get('[data-cy="suppliersCorrespondenceAddressDifferent"]'),
  supplierCorrespondenceAddress: () => address('supplier-correspondence-address'),
  industrySector: () => cy.get('[data-cy="industrySector"]'),
  industryClass: () => cy.get('[data-cy="industryClass"]'),
  smeType: () => cy.get('[data-cy="smeType"]'),
  supplyContractDescription: () => cy.get('[data-cy="supplyContractDescription"]'),

  legallyDistinct: () => cy.get('[data-cy="legallyDistinct"]'),
  indemnifierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="indemnifier-companies-house-registration-number"]'),
  indemnifierName: () => cy.get('[data-cy="indemnifier-name"]'),
  indemnifierAddress: () => address('indemnifier-address'),
  indemnifierCorrespondenceAddressDifferent: () => cy.get('[data-cy="indemnifierCorrespondenceAddressDifferent"]'),
  indemnifierCorrespondenceAddress: () => address('indemnifier-correspondence-address'),

  buyerName: () => cy.get('[data-cy="buyer-name"]'),
  countryOfBuyer: () => cy.get('[data-cy="countryOfBuyer"]'),
  destinationOfGoodsAndServices: () => cy.get('[data-cy="destinationOfGoodsAndServices"]'),

  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  // expectError: (text) => cy.get('.govuk-error-message').contains(text),
};

module.exports = page;

const address = require('./address');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),

  title: () => cy.get('[data-cy="about"]'),

  supplierType: () => cy.get('[data-cy="supplier-type"]'),
  supplierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="supplier-companies-house-registration-number"]'),
  supplierSearchCompaniesHouse: () => cy.get('[data-cy="DoSearch-supplier-companies-house-registration-number"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
  supplierAddress: () => address('supplier-address'),
  supplierCorrespondenceAddressSame: () => cy.get('[data-cy="supplier-correspondence-address-is-different-false"]'),
  supplierCorrespondenceAddressDifferent: () => cy.get('[data-cy="supplier-correspondence-address-is-different-true"]'),
  supplierCorrespondenceAddress: () => address('supplier-correspondence-address'),
  industrySector: () => cy.get('[data-cy="industry-sector"]'),
  industryClass: () => cy.get('[data-cy="industry-class"]'),
  smeTypeMicro: () => cy.get('[data-cy="sme-type-Micro"]'),
  smeTypeSmall: () => cy.get('[data-cy="sme-type-Small"]'),
  smeTypeMedium: () => cy.get('[data-cy="sme-type-Medium"]'),
  smeTypeNotSME: () => cy.get('[data-cy="sme-type-Non-SME"]'),
  supplyContractDescription: () => cy.get('[data-cy="supply-contract-description"]'),

  legallyDistinct: () => cy.get('[data-cy="legallyDistinct-true"]'),
  notLegallyDistinct: () => cy.get('[data-cy="legallyDistinct-false"]'),
  indemnifierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="indemnifier-companies-house-registration-number"]'),
  indemnifierSearchCompaniesHouse: () => cy.get('[data-cy="DoSearch-indemnifier-companies-house-registration-number"]'),
  indemnifierName: () => cy.get('[data-cy="indemnifier-name"]'),
  indemnifierAddress: () => address('indemnifier-address'),
  indemnifierCorrespondenceAddressDifferent: () => cy.get('[data-cy="indemnifierCorrespondenceAddressDifferent-true"]'),
  indemnifierCorrespondenceAddressNotDifferent: () => cy.get('[data-cy="indemnifierCorrespondenceAddressDifferent-false"]'),
  indemnifierCorrespondenceAddress: () => address('indemnifier-correspondence-address'),
  nextPage: () => cy.get('[data-cy="NextPage"]'),
  saveAndGoBack: () => cy.get('[data-cy="SaveAndGoBack"]'),

  expectError: (text) => cy.get('.govuk-error-message').contains(text),
  errors: () => cy.get('.govuk-error-message'),
};

module.exports = page;

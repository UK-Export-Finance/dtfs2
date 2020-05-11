const address = require('./address');
const nav = require('./nav');

const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/about/supplier`),
  nav: () => nav,
  supplierType: () => cy.get('[data-cy="supplier-type"]'),
  supplierCompaniesHouseRegistrationNumber: () => cy.get('[data-cy="supplier-companies-house-registration-number"]'),
  supplierSearchCompaniesHouse: () => cy.get('[data-cy="DoSearch-supplier-companies-house-registration-number"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
  supplierAddress: () => address('supplier-address'),
  supplierCorrespondenceAddressSame: () => cy.get('[data-cy="suppliersCorrespondenceAddressDifferent-false"]'),
  supplierCorrespondenceAddressDifferent: () => cy.get('[data-cy="suppliersCorrespondenceAddressDifferent-true"]'),
  supplierCorrespondenceAddress: () => address('supplier-correspondence-address'),
  industrySector: () => cy.get('[data-cy="industrySector"]'),
  industryClass: () => cy.get('[data-cy="industryClass"]'),
  smeTypeMicro: () => cy.get('[data-cy="smeType-Micro"]'),
  smeTypeSmall: () => cy.get('[data-cy="smeType-Small"]'),
  smeTypeMedium: () => cy.get('[data-cy="smeType-Medium"]'),
  smeTypeNotSME: () => cy.get('[data-cy="smeType-Non-SME"]'),
  supplyContractDescription: () => cy.get('[data-cy="supplyContractDescription"]'),

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
};

module.exports = page;

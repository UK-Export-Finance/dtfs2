/* eslint-disable no-undef */
const financialStatements = {
  url: (id) => `/gef/application-details/${id}/supporting-information/financial-statements`,

  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),

  fileUploadComponent: () => cy.get('[data-cy="file-upload-component"]'),

  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),

  uploadSuccess: (fileName) => cy.get('.moj-multi-file-upload__success').contains(fileName),
  uploadFailure: (fileName) => cy.get('.moj-multi-file-upload__error').contains(fileName),
};

export default financialStatements;

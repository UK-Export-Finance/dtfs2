const manualInclusion = {
  url: (id) => `/gef/application-details/${id}/supporting-information/document/manual-inclusion-questionnaire`,
  templateLinkDocx: () => cy.get('[data-cy="template-link-docx"]'),
  templateLinkPdf: () => cy.get('[data-cy="template-link-pdf"]'),
  fileUploadComponent: () => cy.get('[data-cy="file-upload-component"]'),
  uploadSuccess: (fileName) => cy.get('.moj-multi-file-upload__success').contains(fileName),
  uploadFailure: (fileName) => cy.get('.moj-multi-file-upload__error').contains(fileName),
};

export default manualInclusion;

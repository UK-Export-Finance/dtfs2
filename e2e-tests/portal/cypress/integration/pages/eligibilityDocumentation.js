const page = {
  title: () => cy.get('[data-cy="eligibility"]'),
  questionnaireFileInput: () => cy.get('[data-cy="exporterQuestionnaire"]'),
  questionnaireFileInputUpload: () => cy.get('[data-cy="exporterQuestionnaire-upload"]'),
  questionnaireFileInputUploadButton: () => cy.get('[data-cy="exporterQuestionnaire-upload-button"]'),
  questionnaireFileUploaded: () => cy.get('[data-cy="exporterQuestionnaire-file-uploaded"]'),
  questionnaireFileUploadedRemove: () => cy.get('[data-cy="exporterQuestionnaire-file-uploaded-remove"]'),
  fieldErrorMessage: (fieldname) => cy.get(`[data-cy="${fieldname}"] .govuk-error-message`),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
  downloadMIQuestionaireLinkDoc: () => cy.get('[data-cy="download-q-link-docx"]'),
  downloadMIQuestionaireLinkPdf: () => cy.get('[data-cy="download-q-link-pdf"]'),
};

module.exports = page;

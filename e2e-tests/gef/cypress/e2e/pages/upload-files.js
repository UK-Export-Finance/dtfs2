const uploadFIles = {
  supportingInfoStatus: () => cy.get('[data-cy="supportingInfo-status"]'),
  supportingInfoManualInclusionButton: () => cy.get('[data-cy="supportingInfo__manual-inclusion-cta"]'),
  supportingInfoManagementAccountsButton: () => cy.get('[data-cy="supportingInfo__management-accounts-cta"]'),
  supportingInfoFinancialStatementsButton: () => cy.get('[data-cy="supportingInfo__financial-statements-cta"]'),
  supportingInfoFinancialForecastsButton: () => cy.get('[data-cy="supportingInfo__financial-forecasts-cta"]'),
  supportingInfoFinancialCommentaryButton: () => cy.get('[data-cy="supportingInfo__financial-commentary-cta"]'),
  supportingInfoCorporateStructureButton: () => cy.get('[data-cy="supportingInfo__corporate-structure-cta"]'),
  supportingInfoDebtorCreditorButton: () => cy.get('[data-cy="supportingInfo__debtor-creditor-cta"]'),
  supportingInfoSecurityDetailsButton: () => cy.get('[data-cy="security-details-cta"]'),
  deleteSupportingDocument: (file) => cy.get(`.moj-multi-file-upload__delete[value='${file}']`),
  uploadSuccess: (fileName) => cy.get('.moj-multi-file-upload__success').contains(fileName),
  uploadFailure: (fileName) => cy.get('.moj-multi-file-upload__error').contains(fileName),
  facilitySecurity: () => cy.get('[data-cy="facility-security"]'),
  exporterSecurityError: () => cy.get('[data-cy="exporter-security-error"]'),
  exporterSecurity: () => cy.get('[data-cy="exporter-security"]'),
  continueButton: () => cy.get('[data-cy="submit-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default uploadFIles;

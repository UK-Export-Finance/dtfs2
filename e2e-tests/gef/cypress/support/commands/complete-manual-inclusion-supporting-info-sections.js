import manualInclusion from '../../e2e/pages/manual-inclusion-questionnaire';
import uploadFiles from '../../e2e/pages/upload-files';
import relative from '../relativeURL';

/**
 * completeManualInclusionSupportingInfoSections
 * completes the required uploads and sections to complete an MIA deal
 * @param {string} dealId - the deal id
 */
const completeManualInclusionSupportingInfoSections = (dealId) => {
  // upload manual inclusion document
  cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
  manualInclusion.uploadSuccess('file1.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Management Accounts` section
  uploadFiles.supportingInfoManagementAccountsButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/management-accounts`));
  cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/management-accounts/upload`);
  uploadFiles.uploadSuccess('file1.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Financial Statements` section
  uploadFiles.supportingInfoFinancialStatementsButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-statements`));
  cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/financial-statements/upload`);
  uploadFiles.uploadSuccess('file1.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Financial Forecasts` section
  uploadFiles.supportingInfoFinancialForecastsButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-forecasts`));
  cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/financial-forecasts/upload`);
  uploadFiles.uploadSuccess('file1.png');
  cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/document/financial-forecasts/upload`);
  uploadFiles.uploadSuccess('file2.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Financial Commentary` section
  uploadFiles.supportingInfoFinancialCommentaryButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-commentary`));
  cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/document/financial-commentary/upload`);
  uploadFiles.uploadSuccess('file2.png');
  cy.uploadFile('file3.png', `/gef/application-details/${dealId}/supporting-information/document/financial-commentary/upload`);
  uploadFiles.uploadSuccess('file3.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Corporate Structure` section
  uploadFiles.supportingInfoCorporateStructureButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/corporate-structure`));
  cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/document/corporate-structure/upload`);
  uploadFiles.uploadSuccess('file4.png');
  cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/document/corporate-structure/upload`);
  uploadFiles.uploadSuccess('file5.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // upload files to the `Debtor Creditor` section
  uploadFiles.supportingInfoDebtorCreditorButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports`));
  cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports/upload`);
  uploadFiles.uploadSuccess('file4.png');
  cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports/upload`);
  uploadFiles.uploadSuccess('file5.png');

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // populate the `Security Details` section
  uploadFiles.supportingInfoSecurityDetailsButton().click();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/security-details`));
  cy.keyboardInput(uploadFiles.exporterSecurity(), 'test');
  cy.keyboardInput(uploadFiles.facilitySecurity(), 'test2');
  cy.clickSubmitButton();

  cy.visit(relative(`/gef/application-details/${dealId}`));

  // verify the status of the Supporting Information section is set to `Complete`
  uploadFiles.supportingInfoStatus().should('contain', 'Complete');
};

export default completeManualInclusionSupportingInfoSections;

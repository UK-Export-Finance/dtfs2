import relative from './relativeURL';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import uploadFiles from './pages/upload-files';
import manualInclusion from './pages/manual-inclusion-questionnaire';

context('Upload files to Azure', () => {
  let dealId;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      dealId = body.items[2]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });

  describe('Upload files as a Maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should mark all Eligibility criteria answers as `False`', () => {
      // Make the deal a Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-false"]').trigger('click');
      });
      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      cy.uploadFile('file1.png', `${manualInclusion.url(dealId)}/upload`);
      manualInclusion.uploadSuccess('file1.png');
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/manual-inclusion-questionnaire`));

      cy.visit(relative(`/gef/application-details/${dealId}`));

      uploadFiles.supportingInfoStatus().should('contain', 'In progress');

      uploadFiles.supportingInfoManualInclusionButton().parent().parent().find('.govuk-summary-list__value .govuk-link')
        .should('contain', 'file1.png');
      uploadFiles.supportingInfoManagementAccountsButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoFinancialStatementsButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoFinancialForecastsButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoFinancialCommentaryButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoCorporateStructureButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoDebtorCreditorButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoSecurityDetailsButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
      uploadFiles.supportingInfoExportLicenceButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'Required');
    });

    it('should allow the same document to be uploaded in different sections', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png');
      cy.visit(relative(`/gef/application-details/${dealId}`));
      uploadFiles.supportingInfoManagementAccountsButton().parent().parent().find('.govuk-summary-list__value')
        .should('contain', 'file1.png');
    });

    it('should delete one of the documents', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/management-accounts`));
      uploadFiles.deleteSupportingDocument('file1.png').click();
      uploadFiles.uploadSuccess('file1.png').should('not.exist');
    });

    it('should upload files to the `Management Accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Statements` section', () => {
      uploadFiles.supportingInfoFinancialStatementsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/financial-statements`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/financial-statements/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Forecasts` section', () => {
      uploadFiles.supportingInfoFinancialForecastsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/financial-forecasts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file2.png');
    });

    it('should upload files to the `Financial Commentary` section', () => {
      uploadFiles.supportingInfoFinancialCommentaryButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/financial-commentary`));
      cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file2.png');

      cy.uploadFile('file3.png', `/gef/application-details/${dealId}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file3.png');
    });

    it('should upload files to the `Corporate Structure` section', () => {
      uploadFiles.supportingInfoCorporateStructureButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/corporate-structure`));
      cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should upload files to the `Debtor Creditor` section', () => {
      uploadFiles.supportingInfoDebtorCreditorButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/debtor-creditor-reports`));
      cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should populate the `Security Details` section', () => {
      uploadFiles.supportingInfoSecurityDetailsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/security-details`));
      uploadFiles.exporterSecurity().type('test');
      uploadFiles.facilitySecurity().type('test2');
      uploadFiles.continueButton().click();
    });

    it('should upload files to the `Export Licence` section', () => {
      uploadFiles.supportingInfoExportLicenceButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/export-licence`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file6.png', `/gef/application-details/${dealId}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file6.png');
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });
  });
});

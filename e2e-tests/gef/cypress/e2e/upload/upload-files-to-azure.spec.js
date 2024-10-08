import relative from '../relativeURL';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../pages/application-details';
import uploadFiles from '../pages/upload-files';
import manualInclusion from '../pages/manual-inclusion-questionnaire';

context('Upload files to Azure', () => {
  let dealId;
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;
        cy.login(BANK1_MAKER1);
      });
  });

  describe('Upload files as a Maker', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should mark all Eligibility criteria answers as `False`', () => {
      // Make the deal a Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.manualEligibilityCriteria();
      cy.clickContinueButton();
      cy.clickContinueButton();

      cy.uploadFile('test.pdf', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('test.pdf');
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));

      cy.visit(relative(`/gef/application-details/${dealId}`));

      uploadFiles.supportingInfoStatus().should('contain', 'In progress');

      uploadFiles.supportingInfoManualInclusionButton().parent().parent().find('.govuk-summary-list__value .govuk-link').should('contain', 'test.pdf (47 kB)');
      uploadFiles.supportingInfoManagementAccountsButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoFinancialStatementsButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoFinancialForecastsButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoFinancialCommentaryButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoCorporateStructureButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoDebtorCreditorButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
      uploadFiles.supportingInfoSecurityDetailsButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'Required');
    });

    it('should allow the same document to be uploaded in different sections', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png').should('exist');
      cy.visit(relative(`/gef/application-details/${dealId}`));
      uploadFiles.supportingInfoManagementAccountsButton().parent().parent().find('.govuk-summary-list__value').should('contain', 'file1.png (1 kB)');
    });

    it('should upload files to the `Management Accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png').should('exist');
    });

    it('should delete one of the documents', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/management-accounts`));
      uploadFiles.deleteSupportingDocument('file1.png').click();
      uploadFiles.deleteSupportingDocument('file1.png').should('not.exist');
    });

    it('should upload files to the `Year-to-date management accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png').should('exist');
    });

    it('should upload files to the `Financial Statements` section', () => {
      uploadFiles.supportingInfoFinancialStatementsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-statements`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/financial-statements/upload`);
      uploadFiles.uploadSuccess('file1.png').should('exist');
    });

    it('should upload files to the `Financial Forecasts` section', () => {
      uploadFiles.supportingInfoFinancialForecastsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-forecasts`));
      cy.uploadFile('file1.png', `/gef/application-details/${dealId}/supporting-information/document/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file1.png').should('exist');

      cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/document/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file2.png').should('exist');
    });

    it('should upload files to the `Financial Commentary` section', () => {
      uploadFiles.supportingInfoFinancialCommentaryButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/financial-commentary`));
      cy.uploadFile('file2.png', `/gef/application-details/${dealId}/supporting-information/document/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file2.png').should('exist');

      cy.uploadFile('file3.png', `/gef/application-details/${dealId}/supporting-information/document/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file3.png').should('exist');
    });

    it('should upload files to the `Corporate Structure` section', () => {
      uploadFiles.supportingInfoCorporateStructureButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/corporate-structure`));
      cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/document/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file4.png').should('exist');

      cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/document/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file5.png').should('exist');
    });

    it('should upload files to the `Debtor Creditor` section', () => {
      uploadFiles.supportingInfoDebtorCreditorButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports`));
      cy.uploadFile('file4.png', `/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file4.png').should('exist');

      cy.uploadFile('file5.png', `/gef/application-details/${dealId}/supporting-information/document/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file5.png').should('exist');
    });

    it('should populate the `Security Details` section', () => {
      uploadFiles.supportingInfoSecurityDetailsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/security-details`));
      uploadFiles.exporterSecurity().type('test');
      uploadFiles.facilitySecurity().type('test2');
      cy.clickSubmitButton();
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });
  });
});

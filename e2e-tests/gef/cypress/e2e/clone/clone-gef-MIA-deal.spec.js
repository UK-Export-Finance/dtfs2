import relative from '../relativeURL';
import { form, submitButton } from '../partials';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import applicationDetails from '../pages/application-details';
import aboutExporter from '../pages/about-exporter';
import cloneGEFDeal from '../pages/clone-deal';
import nameApplication from '../pages/name-application';
import mandatoryCriteria from '../pages/mandatory-criteria';
import uploadFiles from '../pages/upload-files';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { today } from '../../../../e2e-fixtures/dateConstants';

context('Clone GEF (MIA) deal', () => {
  let MIAdealId;
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        MIAdealId = body.items[2]._id;
        cy.login(BANK1_MAKER1);
      });
  });
  describe('Clone MIA deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${MIAdealId}`));
    });

    it('should create an MIA deal', () => {
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}`));
      cloneGEFDeal.cloneGefDealLink().should('be.visible');

      // Make the deal an Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.manualEligibilityCriteria();
      cy.clickContinueButton();
      cy.clickContinueButton();

      // upload manual inclusion document
      cy.uploadFile('file1.png', `/gef/application-details/${MIAdealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('file1.png');
    });

    it('should upload files to the `Management Accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAdealId}/supporting-information/document/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Statements` section', () => {
      uploadFiles.supportingInfoFinancialStatementsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/financial-statements`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAdealId}/supporting-information/document/financial-statements/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Forecasts` section', () => {
      uploadFiles.supportingInfoFinancialForecastsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/financial-forecasts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAdealId}/supporting-information/document/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file2.png', `/gef/application-details/${MIAdealId}/supporting-information/document/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file2.png');
    });

    it('should upload files to the `Financial Commentary` section', () => {
      uploadFiles.supportingInfoFinancialCommentaryButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/financial-commentary`));
      cy.uploadFile('file2.png', `/gef/application-details/${MIAdealId}/supporting-information/document/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file2.png');

      cy.uploadFile('file3.png', `/gef/application-details/${MIAdealId}/supporting-information/document/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file3.png');
    });

    it('should upload files to the `Corporate Structure` section', () => {
      uploadFiles.supportingInfoCorporateStructureButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/corporate-structure`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAdealId}/supporting-information/document/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAdealId}/supporting-information/document/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should upload files to the `Debtor Creditor` section', () => {
      uploadFiles.supportingInfoDebtorCreditorButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/document/debtor-creditor-reports`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAdealId}/supporting-information/document/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAdealId}/supporting-information/document/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should populate the `Security Details` section', () => {
      uploadFiles.supportingInfoSecurityDetailsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/supporting-information/security-details`));
      cy.keyboardInput(uploadFiles.exporterSecurity(), 'test');
      cy.keyboardInput(uploadFiles.facilitySecurity(), 'test2');
      cy.clickSubmitButton();
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });

    it('should clone a GEF (MIA) deal', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned MIA deal');
      form().submit();
    });

    it('should modify the Exporter details', () => {
      cy.clickBackLink();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      cy.url().then((url) => {
        cy.visit(`${url}/about-exporter`);
        aboutExporter.mediumRadioButton().click();
        cy.keyboardInput(aboutExporter.probabilityOfDefaultInput(), '10');
        aboutExporter.isFinancingIncreasingRadioNo().click();
        cy.clickSaveAndReturnButton();
      });
    });

    it('should validate the information in the banner', () => {
      cy.clickBackLink();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      cy.url().then((url) => {
        cy.visit(`${url}`);
        statusBanner.bannerStatus().contains('Draft');
        statusBanner.bannerUkefDealId().should('not.exist');
        statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);

        applicationDetails.bankRefName().contains('Cloned MIA deal');
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('In progress');
        applicationDetails.exporterStatus().contains('Completed');
        submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
    });
  });
});

import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import applicationDetails from './pages/application-details';
import aboutExporter from './pages/about-exporter';
import cloneGEFdeal from './pages/clone-deal';
import nameApplication from './pages/name-application';
import mandatoryCriteria from './pages/mandatory-criteria';
import uploadFiles from './pages/upload-files';
import statusBanner from './pages/application-status-banner';
import CREDENTIALS from '../fixtures/credentials.json';

const { format } = require('date-fns');

context('Clone GEF (AIN) deal', () => {
  let AINapplicationId;
  let testApplicationId;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      AINapplicationId = body.items[2]._id;
      testApplicationId = body.items[1]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${testApplicationId}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testApplicationId}/clone`));
      mandatoryCriteria.falseRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      applicationDetails.mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testApplicationId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      nameApplication.form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });

  describe('Clone AIN deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${AINapplicationId}`));
    });

    it('should clone an AIN deal', () => {
      cy.visit(relative(`/gef/application-details/${AINapplicationId}`));
      cy.url().should('eq', relative(`/gef/application-details/${AINapplicationId}`));
      cloneGEFdeal.cloneGefDealLink().should('be.visible');

      // Make the deal an AIN
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();
      applicationDetails.submitButton().click();
      applicationDetails.submitButton().click();

      cy.get('[data-cy="dashboard-link"]').click();
      cy.get(`[data-cy="deal__link--${AINapplicationId}"]`).click();

      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINapplicationId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINapplicationId}/clone/name-application`));
      nameApplication.internalRef().type('Cloned AIN deal');
      nameApplication.form().submit();
      nameApplication.applicationDetailsPage();
    });

    it('should validate the information in the banner', () => {
      cloneGEFdeal.backLink().click();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1)
        .find('.govuk-link')
        .click();
      cy.url().then((url) => {
        cy.visit(`${url}`);
        const bannerDate = format(new Date(), 'dd MMM yyyy');
        statusBanner.bannerStatus().contains('Draft');
        statusBanner.bannerUkefDealId().should('not.exist');
        statusBanner.bannerDateCreated().contains(bannerDate);
        statusBanner.bannerSubmissionType().contains('Automatic Inclusion Notice');

        applicationDetails.bankRefName().contains('Cloned AIN deal');
        applicationDetails.mainHeading().contains('Automatic Inclusion Notice');
        applicationDetails.automaticCoverStatus().contains('Completed');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        applicationDetails.submitButton().should('be.visible');
      });
    });

    it('should modify the Exporter details', () => {
      cloneGEFdeal.backLink().click();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1)
        .find('.govuk-link')
        .click();
      cy.url().then((url) => {
        cy.visit(`${url}/about-exporter`);
        aboutExporter.mediumRadioButton().click();
        aboutExporter.probabilityOfDefaultInput().clear().focused().type('10');
        aboutExporter.isFinancingIncreasingRadioNo().click();
        aboutExporter.saveAndReturnButton().click();
      });
    });
  });
});

context('Clone GEF (MIA) deal', () => {
  let MIAapplicationId;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      MIAapplicationId = body.items[2]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });
  describe('Clone MIA deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${MIAapplicationId}`));
    });

    it('should create an MIA deal', () => {
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}`));
      cloneGEFdeal.cloneGefDealLink().should('be.visible');

      // Make the deal an Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-false"]').trigger('click');
      });
      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      // upload manual inclusion document
      cy.uploadFile('file1.png', `${manualInclusion.url(MIAapplicationId)}/upload`);
      manualInclusion.uploadSuccess('file1.png');
    });

    it('should upload files to the `Management Accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplicationId}/supporting-information/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Statements` section', () => {
      uploadFiles.supportingInfoFinancialStatementsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/financial-statements`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplicationId}/supporting-information/financial-statements/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Forecasts` section', () => {
      uploadFiles.supportingInfoFinancialForecastsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/financial-forecasts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplicationId}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file2.png', `/gef/application-details/${MIAapplicationId}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file2.png');
    });

    it('should upload files to the `Financial Commentary` section', () => {
      uploadFiles.supportingInfoFinancialCommentaryButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/financial-commentary`));
      cy.uploadFile('file2.png', `/gef/application-details/${MIAapplicationId}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file2.png');

      cy.uploadFile('file3.png', `/gef/application-details/${MIAapplicationId}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file3.png');
    });

    it('should upload files to the `Corporate Structure` section', () => {
      uploadFiles.supportingInfoCorporateStructureButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/corporate-structure`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAapplicationId}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAapplicationId}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should upload files to the `Debtor Creditor` section', () => {
      uploadFiles.supportingInfoDebtorCreditorButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/debtor-creditor-reports`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAapplicationId}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAapplicationId}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should populate the `Security Details` section', () => {
      uploadFiles.supportingInfoSecurityDetailsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/security-details`));
      uploadFiles.exporterSecurity().type('test');
      uploadFiles.applicationSecurity().type('test2');
      uploadFiles.continueButton().click();
    });

    it('should upload files to the `Export Licence` section', () => {
      uploadFiles.supportingInfoExportLicenceButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/supporting-information/export-licence`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplicationId}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file6.png', `/gef/application-details/${MIAapplicationId}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file6.png');
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });

    it('should clone a GEF deal', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplicationId}/clone/name-application`));
      nameApplication.internalRef().type('Cloned MIA deal');
      nameApplication.form().submit();
      nameApplication.applicationDetailsPage();
    });

    it('should modify the Exporter details', () => {
      cloneGEFdeal.backLink().click();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1)
        .find('.govuk-link')
        .click();
      cy.url().then((url) => {
        cy.visit(`${url}/about-exporter`);
        aboutExporter.mediumRadioButton().click();
        aboutExporter.probabilityOfDefaultInput().clear().focused().type('10');
        aboutExporter.isFinancingIncreasingRadioNo().click();
        aboutExporter.saveAndReturnButton().click();
      });
    });

    it('should validate the information in the banner', () => {
      cloneGEFdeal.backLink().click();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1)
        .find('.govuk-link')
        .click();
      cy.url().then((url) => {
        cy.visit(`${url}`);
        const bannerDate = format(new Date(), 'dd MMM yyyy');
        statusBanner.bannerStatus().contains('Draft');
        statusBanner.bannerUkefDealId().should('not.exist');
        statusBanner.bannerDateCreated().contains(bannerDate);
        statusBanner.bannerSubmissionType().contains('Manual Inclusion Application');

        applicationDetails.bankRefName().contains('Cloned MIA deal');
        applicationDetails.mainHeading().contains('Manual Inclusion Application');
        applicationDetails.automaticCoverStatus().contains('Completed');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        applicationDetails.submitButton().should('be.visible');
      });
    });
  });
});

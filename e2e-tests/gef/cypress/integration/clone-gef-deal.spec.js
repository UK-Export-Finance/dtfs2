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
  let AINapplication;
  let testApplication;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      AINapplication = body.items[2]._id;
      testApplication = body.items[1]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${testApplication}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testApplication}/clone`));
      mandatoryCriteria.falseRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      applicationDetails.mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testApplication}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      nameApplication.form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });

  describe('Clone AIN deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${AINapplication}`));
    });

    it('should clone an AIN deal', () => {
      cy.visit(relative(`/gef/application-details/${AINapplication}`));
      cy.url().should('eq', relative(`/gef/application-details/${AINapplication}`));
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
      cy.get(`[data-cy="deal__link--${AINapplication}"]`).click();

      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINapplication}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINapplication}/clone/name-application`));
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
  let MIAapplication;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      MIAapplication = body.items[2]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });
  describe('Clone MIA deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${MIAapplication}`));
    });

    it('should create an MIA deal', () => {
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}`));
      cloneGEFdeal.cloneGefDealLink().should('be.visible');

      // Make the deal an Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-false"]').trigger('click');
      });
      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      // upload manual inclusion document
      cy.uploadFile('file1.png', `${manualInclusion.url(MIAapplication)}/upload`);
      manualInclusion.uploadSuccess('file1.png');
    });

    it('should upload files to the `Management Accounts` section', () => {
      uploadFiles.supportingInfoManagementAccountsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/management-accounts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplication}/supporting-information/management-accounts/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Statements` section', () => {
      uploadFiles.supportingInfoFinancialStatementsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/financial-statements`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplication}/supporting-information/financial-statements/upload`);
      uploadFiles.uploadSuccess('file1.png');
    });

    it('should upload files to the `Financial Forecasts` section', () => {
      uploadFiles.supportingInfoFinancialForecastsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/financial-forecasts`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplication}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file2.png', `/gef/application-details/${MIAapplication}/supporting-information/financial-forecasts/upload`);
      uploadFiles.uploadSuccess('file2.png');
    });

    it('should upload files to the `Financial Commentary` section', () => {
      uploadFiles.supportingInfoFinancialCommentaryButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/financial-commentary`));
      cy.uploadFile('file2.png', `/gef/application-details/${MIAapplication}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file2.png');

      cy.uploadFile('file3.png', `/gef/application-details/${MIAapplication}/supporting-information/financial-commentary/upload`);
      uploadFiles.uploadSuccess('file3.png');
    });

    it('should upload files to the `Corporate Structure` section', () => {
      uploadFiles.supportingInfoCorporateStructureButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/corporate-structure`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAapplication}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAapplication}/supporting-information/corporate-structure/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should upload files to the `Debtor Creditor` section', () => {
      uploadFiles.supportingInfoDebtorCreditorButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/debtor-creditor-reports`));
      cy.uploadFile('file4.png', `/gef/application-details/${MIAapplication}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file4.png');

      cy.uploadFile('file5.png', `/gef/application-details/${MIAapplication}/supporting-information/debtor-creditor-reports/upload`);
      uploadFiles.uploadSuccess('file5.png');
    });

    it('should populate the `Security Details` section', () => {
      uploadFiles.supportingInfoSecurityDetailsButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/security-details`));
      uploadFiles.exporterSecurity().type('test');
      uploadFiles.applicationSecurity().type('test2');
      uploadFiles.continueButton().click();
    });

    it('should upload files to the `Export Licence` section', () => {
      uploadFiles.supportingInfoExportLicenceButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/supporting-information/export-licence`));
      cy.uploadFile('file1.png', `/gef/application-details/${MIAapplication}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file1.png');

      cy.uploadFile('file6.png', `/gef/application-details/${MIAapplication}/supporting-information/export-licence/upload`);
      uploadFiles.uploadSuccess('file6.png');
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });

    it('should clone a GEF deal', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MIAapplication}/clone/name-application`));
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

import { format } from 'date-fns';

import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import applicationDetails from './pages/application-details';
import applicationPreview from './pages/application-preview';
import submitToUkef from './pages/submit-to-ukef';
import aboutExporter from './pages/about-exporter';
import cloneGEFdeal from './pages/clone-deal';
import nameApplication from './pages/name-application';
import mandatoryCriteria from './pages/mandatory-criteria';
import uploadFiles from './pages/upload-files';
import statusBanner from './pages/application-status-banner';
import CONSTANTS from '../fixtures/constants';
import CREDENTIALS from '../fixtures/credentials.json';

import { MOCK_FACILITY_ONE } from '../fixtures/mocks/mock-facilities';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import { MOCK_APPLICATION_MIN } from '../fixtures/mocks/mock-deals';

context('Clone GEF (AIN) deal', () => {
  let AINdealId;
  let testDealId;
  let AINDealName;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      AINdealId = body.items[2]._id;
      testDealId = body.items[1]._id;
      AINDealName = body.items[2].bankInternalRefName;
      cy.login(CREDENTIALS.MAKER);
    });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${testDealId}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.falseRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      applicationDetails.mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      nameApplication.internalRef().clear();
      nameApplication.form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });

  describe('Clone AIN deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
    });

    it('Clone button should contain the right text and aria-label', () => {
      cloneGEFdeal.cloneGefDealLink().contains('Clone');
      cloneGEFdeal.cloneGefDealLink().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal(`Clone deal ${AINDealName}`);
      });
    });

    it('should clone an AIN deal', () => {
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}`));
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
      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      nameApplication.internalRef().type('Cloned AIN deal');
      nameApplication.form().submit();
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
        statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);

        applicationDetails.bankRefName().contains('Cloned AIN deal');
        applicationDetails.mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        applicationDetails.submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1)
          .find('.govuk-summary-list__key')
          .contains('Stage');
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

    it('should clone submitted to UKEF AIN deal and reset issueDate on facilities table to -', () => {
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      applicationPreview.submitButton().click();
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();

      cy.login(CREDENTIALS.MAKER);

      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      nameApplication.internalRef().type('Cloned AIN deal');
      nameApplication.form().submit();

      cy.get('[data-cy="success-message-link"]').click();

      applicationDetails.facilitySummaryListRowAction(0, 0).find('.govuk-link').invoke('attr', 'href').then((href) => {
        // get id from href for facility
        const hrefSplit = href.split('/');
        const facilityId = hrefSplit[5];

        cy.get('[data-cy="dashboard"]').click();
        // goes to facilities table and makes sure it's issued and no issue date so properly cloned
        cy.get('[data-cy="dashboard-sub-nav-link-facilities"]').click();
        cy.get(`[data-cy="facility__bankStage--${facilityId}"]`).contains('Issued');
        cy.get(`[data-cy="facility__issuedDate--${facilityId}"]`).contains('-');
      });
    });
  });
});

context('Clone GEF (MIA) deal', () => {
  let MIAdealId;
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER).then((token) => token).then((token) => {
      cy.apiFetchAllApplications(token);
    }).then(({ body }) => {
      MIAdealId = body.items[2]._id;
      cy.login(CREDENTIALS.MAKER);
    });
  });
  describe('Clone MIA deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${MIAdealId}`));
    });

    it('should create an MIA deal', () => {
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}`));
      cloneGEFdeal.cloneGefDealLink().should('be.visible');

      // Make the deal an Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-false"]').trigger('click');
      });
      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

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
      uploadFiles.exporterSecurity().type('test');
      uploadFiles.facilitySecurity().type('test2');
      uploadFiles.continueButton().click();
    });

    it('should verify the status of the Supporting Information section is set to `Complete`', () => {
      uploadFiles.supportingInfoStatus().should('contain', 'Complete');
    });

    it('should clone a GEF (MIA) deal', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MIAdealId}/clone/name-application`));
      nameApplication.internalRef().clear().type('Cloned MIA deal');
      nameApplication.form().submit();
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
        statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);

        applicationDetails.bankRefName().contains('Cloned MIA deal');
        applicationDetails.mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        applicationDetails.submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1)
          .find('.govuk-summary-list__key')
          .contains('Stage');
      });
    });
  });
});

context('Clone GEF (MIN) deal', () => {
  let MINdealId;
  let token;
  let facilityOneId;
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        MINdealId = body._id;
        cy.apiUpdateApplication(MINdealId, token, MOCK_APPLICATION_MIN).then(() => {
          cy.apiCreateFacility(MINdealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
            facilityOneId = facility.body.details._id;
            cy.apiUpdateFacility(facilityOneId, token, MOCK_FACILITY_ONE);
          });
        });
      });
    });
  });
  describe('Clone MIN deal', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${MINdealId}`));
    });

    it('should clone a GEF (MIN) deal', () => {
      cloneGEFdeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone/name-application`));
      nameApplication.internalRef().clear().type('Cloned MIN deal');
      nameApplication.form().submit();

      cy.get('[data-cy="success-message-link"]').click();
      statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);
      statusBanner.bannerStatus().contains('Draft');
      statusBanner.bannerCheckedBy().contains('-');
    });
  });
});

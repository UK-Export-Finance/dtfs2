import { todayFormattedShort } from '../../../../e2e-fixtures/dateConstants';

import relative from '../relativeURL';
import { form, mainHeading, submitButton } from '../partials';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import applicationDetails from '../pages/application-details';
import submitToUkef from '../pages/submit-to-ukef';
import aboutExporter from '../pages/about-exporter';
import cloneGEFDeal from '../pages/clone-deal';
import nameApplication from '../pages/name-application';
import mandatoryCriteria from '../pages/mandatory-criteria';
import uploadFiles from '../pages/upload-files';
import statusBanner from '../pages/application-status-banner';
import CONSTANTS from '../../fixtures/constants';
import { anUnissuedCashFacility } from '../../../../e2e-fixtures/mock-gef-facilities';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN } from '../../fixtures/mocks/mock-deals';

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Clone GEF (AIN) deal', () => {
  let AINdealId;
  let testDealId;
  let AINDealName;
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        AINdealId = body.items[2]._id;
        testDealId = body.items[1]._id;
        AINDealName = body.items[2].bankInternalRefName;
        cy.login(BANK1_MAKER1);
      });
  });

  describe('Validate the creation of a cloned deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${testDealId}`));
    });

    it('should show an error when the mandatory criteria is false', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.falseRadio().click();
      form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
      mainHeading().should('contain', 'This is not eligible for a GEF guarantee');
    });

    it('should show an error when the bank internal reference is empty', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${testDealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      nameApplication.internalRef().clear();
      form().submit();
      nameApplication.formError().should('contain', 'Application reference name is mandatory');
    });
  });

  describe('Clone AIN deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
    });

    it('Clone button should contain the right text and aria-label', () => {
      cloneGEFDeal.cloneGefDealLink().contains('Clone');
      cloneGEFDeal
        .cloneGefDealLink()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(`Clone deal ${AINDealName}`);
        });
    });

    it('should clone an AIN deal', () => {
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}`));
      cloneGEFDeal.cloneGefDealLink().should('be.visible');

      // Make the deal an AIN
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      cy.clickSaveAndReturnButton();
      cy.clickSubmitButton();
      cy.clickSubmitButton();

      cy.get('[data-cy="dashboard-link"]').click();
      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned AIN deal');
      form().submit();
    });

    it('should validate the information in the banner', () => {
      cy.clickBackLink();
      cy.get('table.govuk-table tr').eq(1).find('td').eq(1).find('.govuk-link').click();
      cy.url().then((url) => {
        cy.visit(`${url}`);
        statusBanner.bannerStatus().contains('Draft');
        statusBanner.bannerUkefDealId().should('not.exist');
        statusBanner.bannerDateCreated().contains(todayFormattedShort);

        applicationDetails.bankRefName().contains('Cloned AIN deal');
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
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

    it('should clone submitted to UKEF AIN deal and reset issueDate on facilities table to -', () => {
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${AINdealId}`));
      cy.clickSubmitButton();
      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();

      cy.login(BANK1_MAKER1);

      cy.get(`[data-cy="deal__link--${AINdealId}"]`).click();

      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${AINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned AIN deal');
      form().submit();

      cy.get('[data-cy="success-message-link"]').click();

      applicationDetails
        .facilitySummaryListTable(0)
        .nameAction()
        .invoke('attr', 'href')
        .then((href) => {
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
        statusBanner.bannerDateCreated().contains(todayFormattedShort);

        applicationDetails.bankRefName().contains('Cloned MIA deal');
        applicationDetails.automaticCoverStatus().contains('Not started');
        applicationDetails.facilityStatus().contains('Completed');
        applicationDetails.exporterStatus().contains('Completed');
        submitButton().should('not.exist');
        cy.get('[data-cy="facility-summary-list"]').eq(1).find('.govuk-summary-list__row').eq(1).find('.govuk-summary-list__key').contains('Stage');
      });
    });
  });
});

context('Clone GEF (MIN) deal', () => {
  let MINdealId;
  let token;
  let facilityOneId;
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          MINdealId = body._id;
          cy.apiUpdateApplication(MINdealId, token, MOCK_APPLICATION_MIN).then(() => {
            cy.apiCreateFacility(MINdealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facilityOneId, token, anUnissuedCashFacility({ facilityEndDateEnabled }));
            });
          });
        });
      });
  });
  describe('Clone MIN deal', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${MINdealId}`));
    });

    it('should clone a GEF (MIN) deal', () => {
      cloneGEFDeal.cloneGefDealLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone`));
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative(`/gef/application-details/${MINdealId}/clone/name-application`));
      cy.keyboardInput(nameApplication.internalRef(), 'Cloned MIN deal');
      form().submit();

      cy.get('[data-cy="success-message-link"]').click();
      statusBanner.bannerStatus().contains('Draft');
      statusBanner.bannerCheckedBy().contains('-');
    });
  });
});

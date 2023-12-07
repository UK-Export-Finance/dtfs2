import { todayFormatted, todayFormattedShort } from '../../../e2e-fixtures/dateConstants';

import relative from './relativeURL';
import applicationActivities from './pages/application-activities';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import securityDetails from './pages/security-details';
import applicationSubmission from './pages/application-submission';
import applicationPreview from './pages/application-preview';
import submitToUkef from './pages/submit-to-ukef';
import statusBanner from './pages/application-status-banner';

import CONSTANTS from '../fixtures/constants';
import { toTitleCase } from '../fixtures/helpers';

let deal;
let dealId;

context('Submit AIN deal and check portalActivities', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        const { 2: mia } = body.items;
        deal = mia;
        dealId = mia._id;

        cy.login(BANK1_MAKER1);
      });
  });

  describe('create and submit an MIA', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
      cy.saveSession();
    });

    it('create an MIA as a Maker and submit it to the Checker', () => {
      applicationDetails.automaticCoverDetailsLink().click();

      // Accept all ECs
      cy.automaticEligibilityCriteria();
      // Deny EC
      automaticCover.falseRadioButton(19).click();

      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      securityDetails.continueButton().click();

      applicationDetails.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
    });
  });

  describe('submits to UKEF', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('submits detail to UKEF', () => {
      applicationPreview.submitButton().click();
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();
    });
  });

  describe('check portalActivity Page', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    // ensures that can click between both tabs and correct info is shown
    it('check that subnavigation banner exists and that links work', () => {
      applicationActivities.subNavigationBar().should('exist');
      applicationActivities.subNavigationBarApplication().click();
      applicationPreview.mainHeading().should('exist');
      applicationActivities.activityTimeline().should('not.exist');
      applicationActivities.subNavigationBarActivities().click();
      applicationPreview.mainHeading().should('not.exist');
      applicationActivities.activityTimeline().should('exist');
    });

    // ensures that timeline has relevant information
    it('should display the activity timeline with submission information', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.activityTimeline().should('exist');
      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)}`);
      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)}`).should('not.exist');
      applicationActivities.activityTimeline().contains(todayFormatted);
      applicationActivities.activityTimeline().contains(BANK1_CHECKER1.firstname);
    });

    // ensures that banner is populated correctly
    it('should display the blue status banner', () => {
      applicationActivities.subNavigationBarActivities().click();
      statusBanner.applicationBanner().should('exist');
      statusBanner.bannerDateCreated().contains(todayFormattedShort);
      statusBanner.bannerDateSubmitted().contains(todayFormattedShort);
      statusBanner.bannerCreatedBy().contains(deal.maker.firstname);
      statusBanner.bannerCheckedBy().contains(BANK1_CHECKER1.firstname);
      statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);
    });
  });
});

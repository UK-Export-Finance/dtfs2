import relative from '../relativeURL';
import applicationActivities from '../pages/application-activities';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { mainHeading } from '../partials';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import securityDetails from '../pages/security-details';
import applicationSubmission from '../pages/application-submission';
import submitToUkef from '../pages/submit-to-ukef';
import statusBanner from '../pages/application-status-banner';

import CONSTANTS from '../../fixtures/constants';
import { toTitleCase } from '../../fixtures/helpers';
import { today } from '../../../../e2e-fixtures/dateConstants';

let deal;
let dealId;

context('Submit AIN deal and check portalActivities', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
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

      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
      securityDetails.visit(dealId);
      cy.keyboardInput(securityDetails.exporterSecurity(), 'test');
      cy.keyboardInput(securityDetails.facilitySecurity(), 'test2');
      cy.clickSubmitButton();

      cy.clickSubmitButton();
      cy.clickSubmitButton();
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
      cy.clickSubmitButton();
      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();
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
      mainHeading().should('exist');
      applicationActivities.activityTimeline().should('not.exist');
      applicationActivities.subNavigationBarActivities().click();
      mainHeading().should('not.exist');
      applicationActivities.activityTimeline().should('exist');
    });

    // ensures that timeline has relevant information
    it('should display the activity timeline with submission information', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.activityTimeline().should('exist');
      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)}`);
      applicationActivities
        .activityTimeline()
        .contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)}`)
        .should('not.exist');
      applicationActivities.activityTimeline().contains(today.d_MMMM_yyyy);
      applicationActivities.activityTimeline().contains(BANK1_CHECKER1.firstname);
    });

    // ensures that banner is populated correctly
    it('should display the blue status banner', () => {
      applicationActivities.subNavigationBarActivities().click();
      statusBanner.applicationBanner().should('exist');
      statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);
      statusBanner.bannerDateSubmitted().contains(today.dd_MMM_yyyy);
      statusBanner.bannerCreatedBy().contains(deal.maker.firstname);
      statusBanner.bannerCheckedBy().contains(BANK1_CHECKER1.firstname);
      statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA);
    });
  });
});

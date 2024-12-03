import relative from '../relativeURL';
import { mainHeading } from '../partials';
import applicationActivities from '../pages/application-activities';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../pages/application-details';
import statusBanner from '../pages/application-status-banner';
import submitToUkef from '../pages/submit-to-ukef';
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
        const { 2: ain } = body.items;
        deal = ain;
        dealId = ain._id;

        cy.login(BANK1_MAKER1);
      });
  });

  describe('creates and submits AIN', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('submits to checked as AIN', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      // Make the deal an Automatic Inclusion Notice
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      cy.clickSaveAndReturnButton();

      cy.clickSubmitButton();

      cy.clickSubmitButton();
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

  describe('check "activity" Page', () => {
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

    it('should display the activity timeline with submission information', () => {
      applicationActivities.subNavigationBarActivities().click();

      applicationActivities.activityTimeline().should('exist');

      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)}`);

      applicationActivities
        .activityTimeline()
        .contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)}`)
        .should('not.exist');

      applicationActivities.activityTimeline().contains(today.d_MMMM_yyyy);
      applicationActivities.activityTimeline().contains(BANK1_CHECKER1.firstname);
    });

    it('should display the application banner', () => {
      applicationActivities.subNavigationBarActivities().click();

      statusBanner.applicationBanner().should('exist');

      statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);
      statusBanner.bannerDateSubmitted().contains(today.dd_MMM_yyyy);

      statusBanner.bannerCreatedBy().contains(deal.maker.firstname);
      statusBanner.bannerCheckedBy().contains(BANK1_CHECKER1.firstname);

      statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
    });
  });
});

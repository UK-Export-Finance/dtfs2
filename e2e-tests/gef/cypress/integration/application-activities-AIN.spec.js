import relative from './relativeURL';
import applicationActivities from './pages/application-activities';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import applicationSubmission from './pages/application-submission';
import applicationPreview from './pages/application-preview';
import submitToUkef from './pages/submit-to-ukef';

import { format } from 'date-fns';

let applicationId;

context('Submit AIN deal and check portalActivities', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[2]._id;

        cy.login(CREDENTIALS.MAKER);
      });
  });

  describe('creates and submits AIN', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applicationId}`));
    });

    it('submits to checked as AIN', () => {
      cy.visit(relative(`/gef/application-details/${applicationId}`));

      // Make the deal an Automatic Inclusion Notice
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      applicationDetails.submitButton().click();

      applicationSubmission.submitButton().click();
    });
  });

  describe('submits to UKEF', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${applicationId}`));
    });

    it('submits detail to UKEF', () => {
      applicationPreview.submitButton().click();
      submitToUkef.submitButton().click();
    });
  });

  describe('check portalActivity Page', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applicationId}`));
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
    const date = format(new Date(), 'd MMMM yyyy');
    it('should display the activity timeline with submission information', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.activityTimeline().should('exist');
      applicationActivities.activityTimeline().contains('Automatic inclusion notice submitted to UKEF');
      applicationActivities.activityTimeline().contains('Manual inclusion application submitted to UKEF').should('not.exist');
      applicationActivities.activityTimeline().contains(date);
      applicationActivities.activityTimeline().contains(CREDENTIALS.CHECKER.firstname);
    });

    // ensures that banner is populated correctly
    const bannerDate = format(new Date(), 'dd MMM yyyy');
    it('should display the blue status banner', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.applicationBanner().should('exist');
      applicationActivities.bannerDateCreated().contains(bannerDate);
      applicationActivities.bannerDateSubmitted().contains(bannerDate);
      applicationActivities.bannerCreatedBy().contains(CREDENTIALS.MAKER.firstname);
      applicationActivities.bannerCheckedBy().contains(CREDENTIALS.CHECKER.firstname);
      applicationActivities.bannerSubmissionType().contains('Automatic Inclusion Notice');
    });
  });
});

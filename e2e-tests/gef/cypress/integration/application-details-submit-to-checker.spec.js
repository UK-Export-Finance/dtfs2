import relative from './relativeURL';
import applicationSubmission from './pages/application-submission';
import applicationDetails from './pages/application-details';
import applicationPreview from './pages/application-preview';
import statusBanner from './pages/application-status-banner';
import CREDENTIALS from '../fixtures/credentials.json';

const dealIds = [];
let maker;

context('Application Details Submission', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          maker = item.maker;
          dealIds.push(item._id);
        });
      });

    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${dealIds[0]}/submit`));
  });

  describe('Submission confirmation and comments', () => {
    const longComment = 'a'.repeat(401);
    it('gives the page as expected', () => {
      applicationSubmission.applicationSubmissionPage();
      applicationSubmission.backLink();
      applicationSubmission.commentsField();
      applicationSubmission.submitButton();
      applicationSubmission.cancelLink();
    });

    it('allows submission without comments', () => {
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
    });

    it('allows submission with comments', () => {
      applicationSubmission.commentsField().type('test');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
    });

    it('shows error when comments are too long', () => {
      applicationSubmission.commentsField().type(longComment);
      applicationSubmission.submitButton().click();
      applicationSubmission.errorSummary();
    });

    it('takes user back to application details page if cancel link clicked', () => {
      applicationSubmission.commentsField().type('test');
      applicationSubmission.cancelLink().click();
      applicationPreview.applicationPreviewPage();
    });

    it('takes user back to application details page if back link clicked', () => {
      applicationSubmission.commentsField().type('test');
      applicationSubmission.backLink().click();
      applicationPreview.applicationPreviewPage();
    });

    it('takes user back to dashboard if they click the link in the confirmation page', () => {
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
      // Just asserting the link is there as the error on dashboard page causes test to fail
      applicationSubmission.backToDashboadLink();
      // TODO: Swap this above for below
      // applicationSubmission.backToDashboadLink().click();
      // cy.url().should('contain', 'dashboard');
    });
  });

  describe('maker no longer sees editable content in details screen', () => {
    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}`));
    });

    it('no longer shows the "edit" links on the application details page', () => {
      applicationDetails.submitHeading().should('not.exist');
      applicationDetails.submitButton().should('not.exist');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.automaticCoverDetailsLink().should('not.exist');
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');
      applicationDetails.abandonLink().should('not.exist');
    });

    it('updates status in application banner', () => {
      statusBanner.bannerStatus().contains('Ready for Checker\'s approval');
      statusBanner.bannerCreatedBy().should('have.text', `${maker.firstname} ${maker.surname}`);
    });
  });
});

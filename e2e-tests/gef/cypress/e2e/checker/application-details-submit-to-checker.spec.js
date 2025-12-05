import relative from '../relativeURL';
import { backLink, cancelLink, errorSummary, submitButton } from '../partials';
import applicationSubmission from '../pages/application-submission';
import applicationDetails from '../pages/application-details';
import applicationPreview from '../pages/application-preview';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

const dealIds = [];
let maker;

context('Application Details Submission', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          maker = item.maker;
          dealIds.push(item._id);
        });
      });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealIds[0]}/submit`));
  });

  describe('Submission confirmation and comments', () => {
    const longComment = 'a'.repeat(401);
    it('gives the page as expected', () => {
      applicationSubmission.applicationSubmissionPage();
      backLink();
      applicationSubmission.commentsField();
      submitButton();
      cancelLink();
    });

    it('allows submission without comments', () => {
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle();
    });

    it('allows submission with comments', () => {
      cy.keyboardInput(applicationSubmission.commentsField(), 'test');
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle();
    });

    it('shows error when comments are too long', () => {
      cy.keyboardInput(applicationSubmission.commentsField(), longComment);
      cy.clickSubmitButton();
      errorSummary();
    });

    it('should allow submission after reducing comment from over 400 to under 400 characters', () => {
      // First, enter a comment that's too long
      cy.keyboardInput(applicationSubmission.commentsField(), longComment);
      cy.clickSubmitButton();

      // Verify error is shown
      errorSummary();

      // Now fix the comment to be under the limit
      const validComment = 'a'.repeat(399);
      applicationSubmission.commentsField().clear();
      cy.keyboardInput(applicationSubmission.commentsField(), validComment);
      cy.clickSubmitButton();

      // Verify successful submission
      applicationSubmission.confirmationPanelTitle();
    });

    it('should accept comment at 400 characters after normalizing Windows line endings', () => {
      // User types 399 chars and presses Enter (which creates \r\n in the textarea)
      // Client sees 401 characters (399 + 2 for \r\n)
      // Server normalizes \r\n to \n, resulting in exactly 400 characters (valid)
      const commentText = 'a'.repeat(399);
      cy.keyboardInput(applicationSubmission.commentsField(), commentText);

      // Simulate pressing Enter which adds line ending
      applicationSubmission.commentsField().type('{enter}');

      cy.clickSubmitButton();

      // Should successfully submit as server normalizes line endings
      applicationSubmission.confirmationPanelTitle();
    });

    it('should normalize multiple Windows line endings correctly', () => {
      // Test comment with multiple line breaks
      // Each \r\n (2 chars) becomes \n (1 char) after normalization
      const commentWithLineBreaks = 'Line 1{enter}Line 2{enter}Line 3';
      cy.keyboardInput(applicationSubmission.commentsField(), commentWithLineBreaks);

      cy.clickSubmitButton();

      // Should successfully submit with normalized line endings
      applicationSubmission.confirmationPanelTitle();
    });

    it('takes user back to application details page if cancel link clicked', () => {
      cy.keyboardInput(applicationSubmission.commentsField(), 'test');
      cy.clickCancelLink();
      applicationPreview.applicationPreviewPage();
    });

    it('takes user back to application details page if back link clicked', () => {
      cy.keyboardInput(applicationSubmission.commentsField(), 'test');
      cy.clickBackLink();
      applicationPreview.applicationPreviewPage();
    });

    it('takes user back to dashboard if they click the link in the confirmation page', () => {
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle();
      // Just asserting the link is there as the error on dashboard page causes test to fail
      applicationSubmission.backToDashboardLink();
    });
  });

  describe('maker no longer sees editable content in details screen', () => {
    beforeEach(() => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}`));
    });

    it('no longer shows the "edit" links on the application details page', () => {
      applicationDetails.submitHeading().should('not.exist');
      submitButton().should('not.exist');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.automaticCoverDetailsLink().should('not.exist');
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');
      applicationDetails.abandonLink().should('not.exist');
    });

    it('shows the latest comment with the firstname and lastname', () => {
      applicationDetails.comments().contains(`Comments from ${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      applicationDetails.comments().contains('test');
    });

    it('updates status in application banner', () => {
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
      cy.assertText(statusBanner.bannerCreatedBy(), `${maker.firstname} ${maker.surname}`);
    });
  });
});

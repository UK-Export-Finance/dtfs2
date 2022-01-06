import relative from './relativeURL';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import securityDetails from './pages/security-details';
import applicationSubmission from './pages/application-submission';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';

let dealId;

context('Submit MIA to UKEF', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;

        cy.login(CREDENTIALS.MAKER);
      });
  });

  describe('Login as a Maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Create MIA', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      // Make the deal a Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealId)}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');
      manualInclusion.continueButton().click();
      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type('test');
      securityDetails.applicationSecurity().type('test2');
      securityDetails.continueButton().click();
      securityDetails.visit(dealId);
      securityDetails.cancelButton().click();

      applicationDetails.submitButton().click();

      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
    });
  });

  describe('Login as a Checker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Ensure attachments uploaded are available for download.', () => {
      applicationDetails.supportingInfoList();
    });
  });

  describe('Submit to UKEF', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });

    it('Submission page as expected', () => {
      submitToUkef.mainHeading();
      submitToUkef.comment();
      submitToUkef.submitButton();
      submitToUkef.cancelLink();
    });

    it('Submits without comments and displays the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanelTitle().contains('Manual inclusion application submitted to UKEF');
      submitToUkefConfirmation.confirmationText().contains('We\'ve sent you a confirmation email.');
      submitToUkefConfirmation.dashboardLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });
  });
});

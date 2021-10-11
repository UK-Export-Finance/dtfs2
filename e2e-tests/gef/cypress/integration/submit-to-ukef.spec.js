import relative from './relativeURL';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;

context('Submit to UKEF', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[2]._id;
      });

    cy.login(CREDENTIALS.CHECKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/submit-to-ukef`));
  });

  // TODO: DTFS2-4761 - add negative tests

  describe('Submit to UKEF', () => {
    it('displays the page as expected', () => {
      submitToUkef.mainHeading();
      submitToUkef.comment();
      submitToUkef.submitButton();
      submitToUkef.cancelLink();
    });

    it('display an error when the comment is greater than 400 characters', () => {
      const longComment = 'a'.repeat(401);

      submitToUkef.comment().type(longComment);
      submitToUkef.submitButton().click();
      submitToUkef.errorSummary();
    });

    it('takes checker back to application review page when cancelled', () => {
      submitToUkef.comment().type('Some comments here ....');
      submitToUkef.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${applicationId}`);
    });

    it('takes checker to dashboard from the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.dashboardLink().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits without comments and displays the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel();
      submitToUkefConfirmation.dashboardLink();
    });

    it('submits with comments', () => {
      submitToUkef.comment().type('Test comment');
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel();
    });
  });
});

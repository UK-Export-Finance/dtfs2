import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import applicationDetails from './pages/application-details';
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

        cy.login(CREDENTIALS.MAKER);

        cy.visit(relative(`/gef/application-details/${applicationId}`));

        // Make the deal an Automatic Inclusion Application
        applicationDetails.automaticCoverDetailsLink().click();
        automaticCover.automaticCoverTerm().each(($el, index) => {
          $el.find('[data-cy="automatic-cover-true"]').trigger('click');
          if (index === 7) {
            $el.find('[data-cy="automatic-cover-false"]').trigger('click');
          }
        });
        automaticCover.saveAndReturnButton().click();
      });

    cy.login(CREDENTIALS.CHECKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/submit-to-ukef`));
  });

  describe('Submit to UKEF', () => {
    it('displays the page as expected', () => {
      submitToUkef.mainHeading();
      submitToUkef.comment();
      submitToUkef.submitButton();
      submitToUkef.cancelLink();
    });

    it('submits without comments and displays the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel().contains('Manual Inclusion Application submitted to UKEF');
      submitToUkefConfirmation.dashboardLink();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/submit-to-ukef`));
    });
  });
});

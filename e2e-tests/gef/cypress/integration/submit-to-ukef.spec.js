import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import applicationDetails from './pages/application-details';
import CREDENTIALS from '../fixtures/credentials.json';

const { format } = require('date-fns');

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
        });
        automaticCover.saveAndReturnButton().click();
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
      submitToUkefConfirmation.confirmationPanel().contains('Automatic inclusion notice submitted to UKEF');
      submitToUkefConfirmation.dashboardLink();
    });

    it('submits with comments', () => {
      submitToUkef.comment().type('Test comment');
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel().contains('Automatic inclusion notice submitted to UKEF');
    });

    describe('After submission', () => {
      it('application banner displays the submission date, pending UKEF deal ID and updated status', () => {
        cy.visit(relative(`/gef/application-details/${applicationId}`));

        applicationDetails.bannerStatus().contains('Submitted');
        applicationDetails.bannerUkefDealId();

        const todayFormatted = format(new Date(), 'dd MMM yyyy')
        applicationDetails.bannerDateCreated().contains(todayFormatted);
      });
    });
  });
});

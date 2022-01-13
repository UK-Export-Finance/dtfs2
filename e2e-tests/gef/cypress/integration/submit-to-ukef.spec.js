const { format } = require('date-fns');

import relative from './relativeURL';
import automaticCover from './pages/automatic-cover';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import applicationDetails from './pages/application-details';
import statusBanner from './pages/application-status-banner';
import CREDENTIALS from '../fixtures/credentials.json';

import CONSTANTS from '../fixtures/constants';
import { toTitleCase } from '../fixtures/helpers';

let dealId;

context('Submit to UKEF', () => {
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

        cy.visit(relative(`/gef/application-details/${dealId}`));

        // Make the deal an Automatic Inclusion Application
        applicationDetails.automaticCoverDetailsLink().click();
        automaticCover.automaticCoverTerm().each(($el) => {
          $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        });
        automaticCover.saveAndReturnButton().click();
      });

    cy.login(CREDENTIALS.CHECKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${dealId}/submit-to-ukef`));
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
      cy.location('pathname').should('eq', `/gef/application-details/${dealId}`);
    });

    it('takes checker to dashboard from the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.dashboardLink().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits without comments and displays the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)} submitted to UKEF`);
      submitToUkefConfirmation.dashboardLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });

    it('submits with comments', () => {
      submitToUkef.comment().type('Test comment');
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)} submitted to UKEF`);
      submitToUkefConfirmation.confirmationText().contains('We\'ll send you an email shortly to confirm we\'ve accepted your notice.');
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });

    describe('After submission', () => {
      it('application banner displays the submission date, pending UKEF deal ID and updated status', () => {
        cy.visit(relative(`/gef/application-details/${dealId}`));
        const todayFormatted = format(new Date(), 'dd MMM yyyy');

        statusBanner.bannerDateSubmitted().contains(todayFormatted);
        statusBanner.bannerUkefDealId();
        statusBanner.bannerDateCreated().contains(todayFormatted);
      });
    });
  });
});

import {todayFormattedShort} from '../../../e2e-fixtures/dateConstants';

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
      submitToUkef.mainHeading().contains('Confirm your submission');
      submitToUkef.mainText().contains('you have reviewed the information given');
      submitToUkef.mainText().contains('you want to proceed with the submission');

      submitToUkef.confirmSubmission().contains('I understand and agree');
      submitToUkef.confirmSubmissionCheckbox();
      submitToUkef.confirmSubmissionCheckbox().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Confirm your submission, By submitting to UKEF you confirm that: you have reviewed the information given and you want to proceed with the submission, I understand and agree');
      });
      submitToUkef.submitButton();
      submitToUkef.cancelLink();
    });

    it('display an error when the confirmation checkbox is not checked', () => {
      submitToUkef.submitButton().click();
      submitToUkef.errorSummary().contains('Select that you have reviewed the information given and want to proceed with the submission');
      cy.get('[id="confirmSubmitUkef-error"]').contains('Select that you have reviewed the information given and want to proceed with the submission');
    });

    it('takes checker back to application review page when cancelled', () => {
      submitToUkef.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${dealId}`);
    });

    it('takes checker to dashboard from the confirmation page', () => {
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.dashboardLink().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits once checkbox selected and displays the confirmation page', () => {
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)} submitted to UKEF`);
      submitToUkefConfirmation.confirmation().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Automatic Inclusion Notice submitted to UKEF');
      });
      submitToUkefConfirmation.dashboardLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });

    describe('After submission', () => {
      it('application banner displays the submission date, pending UKEF deal ID and updated status and contains comment in correct format', () => {
        cy.visit(relative(`/gef/application-details/${dealId}`));

        statusBanner.bannerDateSubmitted().contains(todayFormattedShort);
        statusBanner.bannerUkefDealId();
        statusBanner.bannerDateCreated().contains(todayFormattedShort);
      });
    });
  });
});

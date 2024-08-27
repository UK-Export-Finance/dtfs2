import { todayFormattedShort } from '../../../../e2e-fixtures/dateConstants';

import relative from '../relativeURL';
import { errorSummary, mainHeading, submitButton } from '../partials';
import submitToUkef from '../pages/submit-to-ukef';
import submitToUkefConfirmation from '../pages/submit-to-ukef-confirmation';
import applicationDetails from '../pages/application-details';
import statusBanner from '../pages/application-status-banner';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

import CONSTANTS from '../../fixtures/constants';
import { toTitleCase } from '../../fixtures/helpers';

let dealId;

context('Submit to UKEF', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id;

        cy.login(BANK1_MAKER1);

        cy.visit(relative(`/gef/application-details/${dealId}`));

        // Make the deal an Automatic Inclusion Application
        applicationDetails.automaticCoverDetailsLink().click();
        cy.automaticEligibilityCriteria();
        cy.clickSaveAndReturnButton();
      });

    cy.login(BANK1_CHECKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/submit-to-ukef`));
  });

  // TODO: DTFS2-4761 - add negative tests

  describe('Submit to UKEF', () => {
    it('displays the page as expected', () => {
      mainHeading().contains('Confirm your submission');
      submitToUkef.mainText().contains('you have reviewed the information given');
      submitToUkef.mainText().contains('you want to proceed with the submission');

      submitToUkef.confirmSubmission().contains('I understand and agree');
      submitToUkef.confirmSubmissionCheckbox();
      submitToUkef
        .confirmSubmissionCheckbox()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(
            'Confirm your submission, By submitting to UKEF you confirm that: you have reviewed the information given and you want to proceed with the submission, I understand and agree',
          );
        });
      submitButton();
      submitToUkef.cancelLink();
    });

    it('display an error when the confirmation checkbox is not checked', () => {
      cy.clickSubmitButton();
      errorSummary().contains('Select that you have reviewed the information given and want to proceed with the submission');
      cy.get('[id="confirmSubmitUkef-error"]').contains('Select that you have reviewed the information given and want to proceed with the submission');
    });

    it('takes checker back to application review page when cancelled', () => {
      submitToUkef.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${dealId}`);
    });

    it('takes checker to dashboard from the confirmation page', () => {
      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();
      submitToUkefConfirmation.dashboardLink().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits once checkbox selected and displays the confirmation page', () => {
      submitToUkef.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();
      submitToUkefConfirmation.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)} submitted to UKEF`);
      submitToUkefConfirmation
        .confirmation()
        .invoke('attr', 'aria-label')
        .then((label) => {
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

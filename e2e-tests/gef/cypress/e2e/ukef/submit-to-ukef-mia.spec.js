import relative from '../relativeURL';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import manualInclusion from '../pages/manual-inclusion-questionnaire';
import securityDetails from '../pages/security-details';
import applicationSubmission from '../pages/application-submission';
import submitToUkef from '../pages/submit-to-ukef';
import submitToUkefConfirmation from '../pages/submit-to-ukef-confirmation';

import CONSTANTS from '../../fixtures/constants';
import { toTitleCase } from '../../fixtures/helpers';

let dealId;

context('Submit MIA to UKEF', () => {
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
      });
  });

  describe('Login as a Maker', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Create MIA', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));
      applicationDetails.automaticCoverDetailsLink().click();

      // Accept all ECs
      cy.automaticEligibilityCriteria();
      // Deny EC
      automaticCover.falseRadioButton(19).click();

      automaticCover.continueButton().click();
      manualInclusion.continueButton().click();

      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
      manualInclusion.continueButton().click();
      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
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
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Ensure attachments uploaded are available for download.', () => {
      applicationDetails.supportingInfoList();
    });
  });

  describe('Submit to UKEF', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });

    it('Submission page as expected', () => {
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

    it('Submits and displays the confirmation page', () => {
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} submitted to UKEF`);
      submitToUkefConfirmation.confirmationText().contains('We\'ve sent you a confirmation email.');
      submitToUkefConfirmation.dashboardLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit-to-ukef`));
    });
  });
});

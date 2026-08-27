import relative from '../../relativeURL';
import { feedbackPage, problemWithService, utilisationReportUpload } from '../../pages';
import { december2023ToFebruary2024ReportDetails, tfmFacilityForReport, ewcsTfmFacilityForReport } from '../../../fixtures/mockUtilisationReportDetails';
import { NODE_TASKS, BANK2_PAYMENT_REPORT_OFFICER1 } from '../../../../../e2e-fixtures';

const problemWithServicePageHeading = 'Sorry, there is a problem with the service.';

describe('submitting payloads with different file sizes', () => {
  describe('feedback form', () => {
    it('should show the problem with service heading when entering too large a payload in the feedback form', () => {
      feedbackPage.visit();
      cy.keyboardInput(feedbackPage.role(), 'test');
      cy.keyboardInput(feedbackPage.organisation(), 'test');
      feedbackPage.reasonForVisitingSelection().click();
      feedbackPage.easyToUseSelection().click();
      feedbackPage.clearlyExplainedSelection().click();
      feedbackPage.satisfiedSelection().click();
      feedbackPage.howCanWeImprove().invoke('val', 'X'.repeat(150000)).trigger('input');
      feedbackPage.emailAddress().clear();

      cy.clickSubmitButton();

      cy.assertText(problemWithService.heading(), problemWithServicePageHeading);
    });
  });

  describe('utilisation report upload', () => {
    beforeEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [december2023ToFebruary2024ReportDetails]);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityForReport, ewcsTfmFacilityForReport]);

      cy.login(BANK2_PAYMENT_REPORT_OFFICER1);
      cy.visit(relative('/utilisation-report-upload'));
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    });

    it('should show the problem with service heading when uploading a utilisation report with a payload size greater than 5mb', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('oversized-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      cy.assertText(problemWithService.heading(), problemWithServicePageHeading);
    });

    it('should successfully upload a utilisation report with a payload size less than 5mb', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('long-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
    });
  });
});

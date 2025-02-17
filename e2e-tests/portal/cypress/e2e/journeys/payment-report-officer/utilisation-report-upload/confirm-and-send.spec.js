const { utilisationReportUpload, confirmAndSend, problemWithService } = require('../../../pages');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { february2023ReportDetails, tfmFacilityForReport } = require('../../../../fixtures/mockUtilisationReportDetails');

context('Confirm and send', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
  });

  describe('After logging in and submitting a valid file', () => {
    beforeEach(() => {
      cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [february2023ReportDetails]);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityForReport]);

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2023_monthly.xlsx');
      cy.clickContinueButton();

      problemWithService.heading().should('not.exist');
    });

    it('Should route to the Upload Report page when the back button is selected', () => {
      cy.clickBackLink();

      utilisationReportUpload.assertOnThisPage();
    });

    it('Should route to the Upload Report page when the change button is selected', () => {
      confirmAndSend.changeLink().click();

      utilisationReportUpload.assertOnThisPage();
    });

    it('Should route to the Confirmation page when the Confirm and Send button is selected', () => {
      confirmAndSend.confirmAndSendButton().click();

      confirmAndSend.currentUrl().should('contain', '/confirmation');
    });
  });

  describe('After logging in but not submitting a file', () => {
    before(() => {
      cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [february2023ReportDetails]);
    });

    it('Should route to the Upload Report page when you try and access the confirm and send page directly', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload/confirm-and-send'));

      utilisationReportUpload.assertOnThisPage();
    });
  });
});

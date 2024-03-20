const { utilisationReportUpload, confirmAndSend, problemWithService } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { february2023ReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Confirm and send', () => {
  describe('After logging in and submitting a valid file', () => {
    beforeEach(() => {
      cy.removeAllUtilisationReports();
      cy.insertUtilisationReports(february2023ReportDetails);

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2023.xlsx');
      utilisationReportUpload.continueButton().click();

      problemWithService.heading().should('not.exist');
    });

    it('Should route to the Upload Report page when the back button is selected', () => {
      confirmAndSend.backLink().click();

      confirmAndSend.mainHeading().should('not.exist');
      utilisationReportUpload.assertOnThisPage();
    });

    it('Should route to the Upload Report page when the change button is selected', () => {
      confirmAndSend.changeLink().click();

      confirmAndSend.mainHeading().should('not.exist');
      utilisationReportUpload.assertOnThisPage();
    });

    it('Should route to the Confirmation page when the Confirm and Send button is selected', () => {
      confirmAndSend.confirmAndSendButton().click();

      confirmAndSend.mainHeading().should('not.exist');
      confirmAndSend.currentUrl().should('contain', '/confirmation');
    });
  });

  describe('After logging in but not submitting a file', () => {
    it('Should route to the Upload Report page when you try and access the confirm and send page directly', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload/confirm-and-send'));

      utilisationReportUpload.assertOnThisPage();
    });
  });
});

const { utilisationReportUpload, confirmAndSend, confirmation, problemWithService } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { february2023ReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Confirmation', () => {
  after(() => {
    cy.removeAllUtilisationReports();
  });

  describe('After logging in, submitting a file and clicking the confirm and send button', () => {
    beforeEach(() => {
      cy.removeAllUtilisationReports();
      cy.insertUtilisationReports(february2023ReportDetails);

      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2023_monthly.xlsx');
      utilisationReportUpload.continueButton().click();
      confirmAndSend.confirmAndSendButton().click();

      problemWithService.heading().should('not.exist');
    });

    it('Should render confirmation heading', () => {
      confirmation.mainHeading().should('exist');
    });

    it('Should route to the login page when the sign-out button is selected', () => {
      confirmation.signOutButton().click();

      confirmation.mainHeading().should('not.exist');
      confirmation.currentUrl().should('contain', '/login');
    });
  });

  describe('After logging in but not submitting a file', () => {
    before(() => {
      cy.removeAllUtilisationReports();
      cy.insertUtilisationReports(february2023ReportDetails);
    });

    it('Should route to the Upload Report page when you try and access the confirm and send page directly', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload/confirm-and-send'));

      utilisationReportUpload.assertOnThisPage();
    });
  });
});

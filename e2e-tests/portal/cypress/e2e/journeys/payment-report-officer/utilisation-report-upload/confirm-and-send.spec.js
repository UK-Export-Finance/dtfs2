const { utilisationReportUpload, confirmAndSend } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Confirm and send', () => {
  describe('After logging in and submitting a valid file', () => {
    beforeEach(() => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report.xlsx');
      utilisationReportUpload.continueButton().click();
    });

    it('Should route to the Upload Report page when the back button is selected', () => {
      confirmAndSend.backLink().click();

      confirmAndSend.mainHeading().should('not.exist');
      confirmAndSend.currentUrl().should('contain', '/utilisation-report-upload');
    });

    it('Should route to the Upload Report page when the change button is selected', () => {
      confirmAndSend.changeLink().click();

      confirmAndSend.mainHeading().should('not.exist');
      confirmAndSend.currentUrl().should('contain', '/utilisation-report-upload');
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

      confirmAndSend.currentUrl().should('contain', '/utilisation-report-upload');
    });
  });
});

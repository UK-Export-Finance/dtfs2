const { utilisationReportUpload } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

const { BANK1_PAYMENT_OFFICER1 } = MOCK_USERS;

context('Utilisation report upload', () => {
  describe('Submitting a file to the utilisation report upload', () => {
    it('Should route to the Confirm and Send page when a file is successfully validated', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
      utilisationReportUpload.currentUrl().should('contain', '/confirm-and-send');
    });

    it('should display an error when trying to upload the wrong type of file', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('questionnaire.pdf');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error when trying to upload a file that is too large', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('test-large-file.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if no file has been selected', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if the file selected is password protected', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('password-protected-report.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
      utilisationReportUpload.utilisationReportFileInputErrorMessage().contains('password protected');
    });
  });

  describe('Failing data validation on file upload', () => {
    it('should display a summary of errors for an invalid .xlsx file', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 6);
    });

    it('should display a summary of errors for an invalid .csv file', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 5);
    });

    it('should allow a file to be re-uploaded after failing the data validation', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
    });
  });
});

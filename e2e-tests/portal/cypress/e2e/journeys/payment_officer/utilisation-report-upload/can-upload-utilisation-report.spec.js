const { utilisationReportUpload } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Utilisation report upload', () => {
  describe('Submitting a file to the utilisation report upload', () => {
    it('Should route to the next page when a file is successfully upload', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('test-csv.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
    });

    it('should display an error when trying to upload the wrong type of file', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('questionnaire.pdf');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error when trying to upload a file that is too large', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('test-large-file.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if no file has been selected', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });
  });

  describe('Failing data validation on file upload', () => {
    it('should display a summary of errors for an invalid .xlsx file', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 6);
    });

    it('should display a summary of errors for an invalid .csv file', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 5);
    });

    it('should allow a file to be re-uploaded after failing the data validation', () => {
      // TODO FN-965 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
    });
  });
});

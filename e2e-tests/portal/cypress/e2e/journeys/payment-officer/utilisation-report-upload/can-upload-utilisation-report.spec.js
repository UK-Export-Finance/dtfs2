const { utilisationReportUpload } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Utilisation report upload', () => {
  describe('Submitting a file to the utilisation report upload', () => {
    it('Should route to the next page when a file is successfully upload', () => {
      // TODO FN-955 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('test-csv.csv');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
    });

    it('should display an error when trying to upload the wrong type of file', () => {
      // TODO FN-955 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('questionnaire.pdf');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error when trying to upload a file that is too large', () => {
      // TODO FN-955 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.utilisationReportFileInput().attachFile('test-large-file.xlsx');
      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if no file has been selected', () => {
      // TODO FN-955 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/utilisation-report-upload'));

      utilisationReportUpload.continueButton().click();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });
  });
});

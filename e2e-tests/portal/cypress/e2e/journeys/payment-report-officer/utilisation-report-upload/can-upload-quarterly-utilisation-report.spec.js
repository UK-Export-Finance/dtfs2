const { errorSummary, mainHeading } = require('../../../partials');
const { utilisationReportUpload } = require('../../../pages');
const { NODE_TASKS, BANK2_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { december2023ToFebruary2024ReportDetails, tfmFacilityForReport } = require('../../../../fixtures/mockUtilisationReportDetails');

context('Quarterly utilisation report upload', () => {
  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [december2023ToFebruary2024ReportDetails]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityForReport]);

    cy.login(BANK2_PAYMENT_REPORT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
  });

  describe('Submitting a file to the utilisation report upload', () => {
    it('Should route to the Confirm and Send page when a file is successfully validated', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
      utilisationReportUpload.currentUrl().should('contain', '/confirm-and-send');
    });

    it('should display an error if the file selected does not contain the current report period', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-November_2023_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
      utilisationReportUpload
        .utilisationReportFileInputErrorMessage()
        .contains("The selected file must contain the reporting period as part of its name, for example '02-2024'");
    });

    it("should display an error if the file selected does not contain the word 'quarterly'", () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-next_week.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
      utilisationReportUpload.utilisationReportFileInputErrorMessage().contains("The selected file must contain the word 'quarterly'");
    });

    it('should display an error when trying to upload the wrong type of file', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('questionnaire_February_2024_quarterly.pdf');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error when trying to upload a file that is too large', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('test-large-file-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if no file has been selected', () => {
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });

    it('should display an error if the file selected is password protected', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('password-protected-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
      utilisationReportUpload.utilisationReportFileInputErrorMessage().contains('password protected');
      mainHeading().contains('Report GEF utilisation and fees');
    });

    it('should display the check the report page with an error if uploading a file with an error on the check the report page', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInput().attachFile('password-protected-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      errorSummary().should('exist');
      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('have.length', 1);
    });
  });

  describe('Failing data validation on file upload', () => {
    it('should display a summary of errors for an invalid .xlsx file', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.checkReportTitle().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 9);

      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 1,
        message: 'Facility utilisation header is missing or spelt incorrectly',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 2,
        message: 'Fees paid to UKEF currency header is missing or spelt incorrectly',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 3,
        message: 'UKEF facility ID must be an 8 to 10 digit number',
        exporter: 'Exporter 1',
        row: '2',
        column: 'B',
        entry: '20001371123',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 4,
        message: 'Fees paid to UKEF for the period must have an entry',
        exporter: 'Exporter 1',
        row: '2',
        column: 'H',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 5,
        message: 'UKEF facility ID must be an 8 to 10 digit number',
        exporter: 'Exporter 2',
        row: '3',
        column: 'B',
        entry: 'aw',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 6,
        message: 'Total fees accrued for the period must have an entry',
        exporter: 'Exporter 2',
        row: '3',
        column: 'G',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 7,
        message: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
        exporter: 'Fish Exporter',
        row: '4',
        column: 'B',
        entry: '20001499',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 8,
        message: 'Total fees accrued for the period must be a number with a maximum of two decimal places',
        exporter: 'Fish Exporter',
        row: '4',
        column: 'G',
        entry: '124.758',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 9,
        message: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
        exporter: 'Potato Exporter',
        row: '5',
        column: 'B',
        entry: '20001507',
      });
    });

    it('should display a summary of errors for an invalid .csv file', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2024_quarterly.csv');
      cy.clickContinueButton();

      utilisationReportUpload.checkReportTitle().should('exist');
      errorSummary().should('exist');
      utilisationReportUpload.validationErrorTable().should('exist');
      utilisationReportUpload.validationErrorTableRows().should('have.length', 8);

      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 1,
        message: 'Facility utilisation header is missing or spelt incorrectly',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 2,
        message: 'Fees paid to UKEF currency header is missing or spelt incorrectly',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 3,
        message: 'UKEF facility ID must be an 8 to 10 digit number',
        exporter: 'Exporter 1',
        row: '2',
        column: 'B',
        entry: '20001371123',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 4,
        message: 'Fees paid to UKEF for the period must have an entry',
        exporter: 'Exporter 1',
        row: '2',
        column: 'H',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 5,
        message: 'UKEF facility ID must be an 8 to 10 digit number',
        exporter: 'Exporter 2',
        row: '3',
        column: 'B',
        entry: 'aw',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 6,
        message: 'Total fees accrued for the period must have an entry',
        exporter: 'Exporter 2',
        row: '3',
        column: 'G',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 7,
        message: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
        exporter: 'Fish Exporter',
        row: '4',
        column: 'B',
        entry: '20001499',
      });
      cy.assertValidationErrorTableRowContains({
        tableRowIndex: 8,
        message: 'The facility ID has not been recognised. Enter a facility ID for a general export facility.',
        exporter: 'Potato Exporter',
        row: '5',
        column: 'B',
        entry: '20001507',
      });
    });

    describe('when the base currency and facility utilisation values do not match for the same facility id', () => {
      it('should display a summary of errors', () => {
        utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-matching-utilisation-report-February_2024_quarterly.csv');
        cy.clickContinueButton();

        utilisationReportUpload.checkReportTitle().should('exist');
        errorSummary().should('exist');
        utilisationReportUpload.validationErrorTable().should('exist');
        utilisationReportUpload.validationErrorTableRows().should('have.length', 6);

        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 1,
          message: 'The currency does not match the other records for this facility. Enter the correct currency.',
          exporter: 'Potato Exporter',
          row: '2',
          column: 'D',
          entry: 'EUR',
        });
        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 2,
          message: 'The currency does not match the other records for this facility. Enter the correct currency.',
          exporter: 'Potato Exporter 1',
          row: '3',
          column: 'D',
          entry: 'USD',
        });
        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 3,
          message: 'The currency does not match the other records for this facility. Enter the correct currency.',
          exporter: 'Potato Exporter 2',
          row: '4',
          column: 'D',
          entry: 'USD',
        });

        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 4,
          message: 'The utilisation does not match the other records for this facility. Enter the correct utilisation.',
          exporter: 'Potato Exporter',
          row: '2',
          column: 'F',
          entry: '1589318.23',
        });
        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 5,
          message: 'The utilisation does not match the other records for this facility. Enter the correct utilisation.',
          exporter: 'Potato Exporter 1',
          row: '3',
          column: 'F',
          entry: '1589319.23',
        });
        cy.assertValidationErrorTableRowContains({
          tableRowIndex: 6,
          message: 'The utilisation does not match the other records for this facility. Enter the correct utilisation.',
          exporter: 'Potato Exporter 2',
          row: '4',
          column: 'F',
          entry: '1589319.23',
        });
      });
    });

    it('should allow a file to be re-uploaded after failing the data validation', () => {
      utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2024_quarterly.csv');
      cy.clickContinueButton();

      utilisationReportUpload.checkReportTitle().should('exist');

      utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2024_quarterly.xlsx');
      cy.clickContinueButton();

      utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
      utilisationReportUpload.currentUrl().should('contain', '/confirm-and-send');
    });
  });
});

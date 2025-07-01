const { utilisationReportUpload } = require('../../../pages');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const {
  february2023ReportDetails,
  march2023ReportDetails,
  tfmFacilityForReport,
  ewcsTfmFacilityForReport,
} = require('../../../../fixtures/mockUtilisationReportDetails');

context('Monthly utilisation report upload with invalid currencies', () => {
  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [march2023ReportDetails, february2023ReportDetails]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityForReport, ewcsTfmFacilityForReport]);

    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
  });

  it('should display the exporter names correctly in the errors tables', () => {
    utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2023_monthly-invalid-currencies.xlsx');
    cy.clickContinueButton();

    utilisationReportUpload.checkReportTitle().should('exist');
    utilisationReportUpload.validationErrorTable().should('exist');
    utilisationReportUpload.validationErrorTableRows().should('have.length', 8);

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 1,
      exporter: 'Rainbo Supplies and Services Ltd',
      row: '2',
      column: 'D',
      entry: 'eur',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 2,
      exporter: 'Rainbo Supplies and Services Ltd',
      row: '2',
      column: 'I',
      entry: 'gbp',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 3,
      exporter: 'Rainbo Supplies and Services Ltd',
      row: '2',
      column: 'J',
      entry: 'jpy',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 4,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'D',
      entry: 'INR',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 5,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'I',
      entry: 'KSH',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 6,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'J',
      entry: 'BHD',
      message: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 7,
      exporter: 'Rainbo Supplies and Services Ltd',
      row: '2',
      column: 'D',
      entry: 'eur',
      message: 'The currency does not match the other records for this facility. Enter the correct currency.',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 8,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'D',
      entry: 'INR',
      message: 'The currency does not match the other records for this facility. Enter the correct currency.',
    });
  });

  it('should display the correct error message when no valid currencies are found', () => {
    utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2023_monthly-empty-currencies.xlsx');
    cy.clickContinueButton();

    utilisationReportUpload.checkReportTitle().should('exist');
    utilisationReportUpload.validationErrorTable().should('exist');
    utilisationReportUpload.validationErrorTableRows().should('have.length', 3);

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 1,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'D',
      entry: '',
      message: 'Base currency must have an entry',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 2,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'I',
      entry: '',
      message: 'Fees paid to UKEF currency must have an entry',
    });

    cy.assertValidationErrorTableRowContains({
      tableRowIndex: 3,
      exporter: 'Cerca Magnetics Ltd',
      row: '3',
      column: 'J',
      entry: '',
      message: 'Payment currency must have an entry when a payment exchange rate is supplied',
    });
  });
});

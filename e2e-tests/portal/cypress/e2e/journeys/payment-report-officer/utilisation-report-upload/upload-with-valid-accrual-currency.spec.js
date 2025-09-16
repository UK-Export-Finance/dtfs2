const { utilisationReportUpload } = require('../../../pages');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const {
  february2023ReportDetails,
  march2023ReportDetails,
  tfmFacilityForReport,
  ewcsTfmFacilityForReport,
} = require('../../../../fixtures/mockUtilisationReportDetails');

context('Monthly utilisation report upload with valid accrual currencies', () => {
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

  it('should route to the Confirm and Send page when a file is successfully validated with valid accrual currencies', () => {
    utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report-February_2023_monthly_accrual_currency.xlsx');
    cy.clickContinueButton();

    utilisationReportUpload.utilisationReportFileInputErrorMessage().should('not.exist');
    utilisationReportUpload.currentUrl().should('contain', '/confirm-and-send');
  });
});

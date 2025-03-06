const { utilisationReportUpload } = require('../../../pages');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const {
  february2023ReportDetails,
  march2023ReportDetails,
  tfmFacilityForReport,
  ewcsTfmFacilityForReport,
} = require('../../../../fixtures/mockUtilisationReportDetails');

context('Monthly utilisation report upload with rich text', () => {
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
    utilisationReportUpload.utilisationReportFileInput().attachFile('invalid-utilisation-report-February_2023_monthly-rich-text.xlsx');
    cy.clickContinueButton();

    utilisationReportUpload.checkReportTitle().should('exist');
    utilisationReportUpload.validationErrorTable().should('exist');
    utilisationReportUpload.validationErrorTableRows().should('have.length', 2);

    cy.assertText(utilisationReportUpload.validationErrorExporter(1), 'Rainbo Supplies and Services Ltd');
    cy.assertText(utilisationReportUpload.validationErrorExporter(2), 'Cerca Magnetics Ltd');
  });
});

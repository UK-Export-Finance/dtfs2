const { uploadPreviousUtilisationReports } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relative = require('../../../relativeURL');
const { overdueReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Show overdue reports', () => {
  before(() => {
    cy.insertUtilisationReportDetails(overdueReportDetails);
  });

  after(() => {
    cy.removeAllUtilisationReportDetails();
  });

  it('should render to upload-previous-utilisation-report template when a report is overdue', () => {
    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relative('/utilisation-report-upload'));

    uploadPreviousUtilisationReports.utilisationReportFileInput().should('exist');
    uploadPreviousUtilisationReports.continueButton().should('exist');
    uploadPreviousUtilisationReports.warningText().should('exist');
    uploadPreviousUtilisationReports.dueReportsList().should('exist');
  });
});

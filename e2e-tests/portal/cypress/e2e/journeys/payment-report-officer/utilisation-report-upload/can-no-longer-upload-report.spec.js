const { utilisationReportUpload, problemWithService } = require('../../../pages');
const { NODE_TASKS, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { upToDateReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

context('Utilisation report upload', () => {
  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
  });

  it('should not allow you to upload a report if the current report period report has been submitted', () => {
    cy.task('getUserFromDbByEmail', BANK1_PAYMENT_REPORT_OFFICER1.email).then((user) => {
      const { _id } = user;
      upToDateReportDetails[0].uploadedByUserId = _id.toString();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [upToDateReportDetails]);
    });

    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));

    problemWithService.heading().should('not.exist');

    utilisationReportUpload.continueButton().should('not.exist');
  });
});

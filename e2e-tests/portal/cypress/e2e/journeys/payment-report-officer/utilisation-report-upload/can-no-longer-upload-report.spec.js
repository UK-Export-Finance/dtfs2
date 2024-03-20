const { utilisationReportUpload, problemWithService } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { upToDateReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Utilisation report upload', () => {
  before(() => {
    cy.removeAllUtilisationReports();
  });

  after(() => {
    cy.removeAllUtilisationReports();
  });

  it('should not allow you to upload a report if the current report period report has been submitted', () => {
    cy.insertUtilisationReports(upToDateReportDetails);

    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));

    problemWithService.heading().should('not.exist');

    utilisationReportUpload.continueButton().should('not.exist');
  });
});

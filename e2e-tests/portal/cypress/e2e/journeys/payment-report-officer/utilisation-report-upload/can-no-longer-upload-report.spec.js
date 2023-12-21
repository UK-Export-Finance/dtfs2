const { utilisationReportUpload } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { upToDateReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('Utilisation report upload', () => {
  before(() => {
    cy.removeAllUtilisationReportDetails();
  });

  after(() => {
    cy.removeAllUtilisationReportDetails();
  });

  it('should not allow you to upload a report if the current report period report has been submitted', () => {
    cy.insertUtilisationReportDetails(upToDateReportDetails);

    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));

    utilisationReportUpload.continueButton().should('not.exist');
  });
});

/* eslint-disable no-undef */
import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import nameApplication from './pages/name-application';
import applicationDetails from './pages/application-details';

context('Application Details Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.fixture('credentials')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    mandatoryCriteria.form().submit();
    nameApplication.internalRef().type('NEW_REF_NAME');
    nameApplication.form().submit();
  });

  describe('Visiting page for the first time', () => {
    it('displays the correct headings', () => {
      applicationDetails.applicationDetailsPage();
      applicationDetails.captionHeading();
      applicationDetails.mainHeading();
    });

    it('displays the correct exporter elements', () => {
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('Not started');
      applicationDetails.exporterDetailsLink();
      applicationDetails.exporterSummaryList().should('not.exist');
    });

    it('displays the correct facility elements', () => {
      applicationDetails.facilityHeading();
      applicationDetails.facilityStatus().contains('Not started');
      applicationDetails.facilityAddLink();
      applicationDetails.facilitySummaryList().should('not.exist');
      applicationDetails.facilityAddAnotherButton().should('not.exist');
    });

    it('displays the correct submit elements', () => {
      applicationDetails.submitHeading();
      applicationDetails.submitButton().should('not.exist');
      applicationDetails.submitValidationText();
    });
  });
});

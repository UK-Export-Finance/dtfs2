/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import applicationDetails from './pages/application-details';
import CREDENTIALS from '../fixtures/credentials.json';

const applicationIds = [];

context('Application Details Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          applicationIds.push(item._id);
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationIds[0]}`));
  });

  describe('Visiting page for the first time - NOT STARTED', () => {
    it('displays the application banner', () => {
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.bankRefName().should('have.text', 'Barclays 123');
    });

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

    it('takes you to companies house page when clicking on `Enter details`', () => {
      applicationDetails.exporterDetailsLink().click();
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}/companies-house`));
    });

    it('keeps you on the same page for now when clicking on `Abandon` link', () => {
      applicationDetails.abandonLink().click();
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}`));
    });
  });

  describe('Visiting page when IN PROGRESS status', () => {
    it('displays the application banner', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}`));
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.bankRefName().should('have.text', 'Natwest 123');
    });

    it('displays the correct exporter elements', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}`));
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('In progress');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });
  });

  describe('Visiting page when COMPLETED status', () => {
    it('displays the application banner', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
      applicationDetails.applicationBanner();
      applicationDetails.abandonLink();
      applicationDetails.bankRefName().should('have.text', 'HSBC 123');
    });

    it('displays the correct exporter elements', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
      applicationDetails.exporterHeading();
      applicationDetails.exporterStatus().contains('Completed');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.exporterSummaryList();
    });
  });
});

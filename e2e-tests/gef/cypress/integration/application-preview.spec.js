/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import applicationPreview from './pages/application-preview';
import CREDENTIALS from '../fixtures/credentials.json';

const applicationIds = [];

context('Application Checker Preview Page', () => {
  before(() => {
    cy.on('uncaught:exception', () => false);
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
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
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationIds[2]}/preview`));
  });

  describe('Visiting checker preview page', () => {
    it('displays the application summary section', () => {
      applicationPreview.status();
      applicationPreview.product();
      applicationPreview.dateCreated();
      applicationPreview.submissionType();
      applicationPreview.createdBy();
      applicationPreview.exporter();
      applicationPreview.checkedBy();
    });

    it('displays the Task and comment entries', () => {
      applicationPreview.task();
      applicationPreview.comments();
    });

    it('displays the application banner elements', () => {
      applicationPreview.applicationBanner();
      applicationPreview.backLink();
      applicationPreview.bankReference()
        .should('have.text', 'HSBC 123');
    });

    it('displays the correct exporter elements', () => {
      applicationPreview.exporterHeading();
      applicationPreview.exporterSummaryList();
    });

    it('displays the correct automatic cover elements', () => {
      applicationPreview.automaticCoverHeading();
      applicationPreview.automaticCoverSummaryList();
    });

    it('displays the correct facility summary elements', () => {
      applicationPreview.facilityHeading();
      applicationPreview.facilitySummaryList();
    });

    it('displays the correct submit elements', () => {
      applicationPreview.submitHeading();
      applicationPreview.submitButton();
      applicationPreview.returnButton();
    });
  });

  describe('When the application is not complete, visiting checker preview page', () => {
    it('redirects to the applications and notices page', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}/preview`));
      cy.location('pathname').should('eq', '/dashboard/0');
    });
  });
});

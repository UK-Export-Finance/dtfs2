/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import aboutExporter from './pages/about-exporter';
import CREDENTIALS from '../fixtures/credentials.json';

const applicationIds = [];
let token;

context('About Exporter Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
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
    cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      aboutExporter.backLink();
      aboutExporter.headingCaption();
      aboutExporter.mainHeading();
      aboutExporter.form();
      aboutExporter.industryTitle();
      aboutExporter.industry().should('be', 'invisible');
      aboutExporter.microRadioButton();
      aboutExporter.smallRadioButton();
      aboutExporter.mediumRadioButton();
      aboutExporter.notSMERadioButton();
      aboutExporter.probabilityOfDefaultInput();
      aboutExporter.isFinancingIncreasingRadioYes();
      aboutExporter.isFinancingIncreasingRadioNo();
      aboutExporter.continueButton();
      aboutExporter.saveAndReturnButton();
    });

    it('displays the correct amount of industries', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}/about-exporter`));
      aboutExporter.industry().its('length').should('be.eq', 3);
    });

    it('redirects user to enter exporters address page when clicking on `Back` Link', () => {
      aboutExporter.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0]}/enter-exporters-correspondence-address`));
    });
  });

  describe('Clicking on Continue', () => {
    it('validates form', () => {
      aboutExporter.continueButton().click();
      aboutExporter.errorSummary();
      aboutExporter.smeTypeError();
      aboutExporter.probabilityOfDefaultError();
      aboutExporter.isFinancingIncreasingError();
    });

    it('takes user back to application details page when form has been filled in', () => {
      aboutExporter.microRadioButton().click();
      aboutExporter.probabilityOfDefaultInput().type('20');
      aboutExporter.isFinancingIncreasingRadioYes().click();
      aboutExporter.continueButton().click();
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}`));
    });
  });

  describe('Clicking on Save and return, bypasses validation and takes user back to application details page', () => {
    it('validates form', () => {
      aboutExporter.saveAndReturnButton().click();
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}`));
    });
  });
});

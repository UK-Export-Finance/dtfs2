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
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}/about-exporter`));

      aboutExporter.backLink();
      aboutExporter.headingCaption();
      aboutExporter.mainHeading();
      aboutExporter.form();
      aboutExporter.industryTitle();
      aboutExporter.microRadioButton();
      aboutExporter.smallRadioButton();
      aboutExporter.mediumRadioButton();
      aboutExporter.notSMERadioButton();
      aboutExporter.probabilityOfDefaultInput();
      aboutExporter.isFinancingIncreasingRadioYes();
      aboutExporter.isFinancingIncreasingRadioNo();
      aboutExporter.doneButton();
      aboutExporter.saveAndReturnButton();
    });

    it('redirects user to enter exporters address page when clicking on `Back` Link', () => {
      aboutExporter.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[1]}/enter-exporters-correspondence-address`));
    });

    it('displays selected Industry string', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}/about-exporter`));
      aboutExporter.industry();
    });

    it('displays no industry options', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[1]}/about-exporter`));
      aboutExporter.industries().should('be', 'invisible');
    });
  });

  describe('Visiting page with multiple industries', () => {
    it('displays the correct amount of industries', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}/about-exporter`));
      aboutExporter.industries().find('input[type="radio"]').its('length').should('be.eq', 3);
    });
  });

  describe('Clicking on Done', () => {
    it('validates form', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
      aboutExporter.doneButton().click();
      aboutExporter.errorSummary();
      aboutExporter.probabilityOfDefaultError();
      aboutExporter.isFinancingIncreasingError();
    });

    it('takes user back to application details page when form has been filled in', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
      aboutExporter.microRadioButton().click();
      aboutExporter.probabilityOfDefaultInput().type('10');
      aboutExporter.isFinancingIncreasingRadioYes().click();
      aboutExporter.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0]}`));
    });
  });

  describe('Clicking on Save and return, bypasses validation and takes user back to application details page', () => {
    it('validates form', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}/about-exporter`));
      aboutExporter.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0]}`));
    });
  });
});

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import companiesHouse from './pages/companies-house';
import CREDENTIALS from '../fixtures/credentials.json';

let dealWithEmptyExporter;

context('Companies House Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealWithEmptyExporter = body.items.find((deal) =>
          deal.exporter.status === 'In progress');
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}/companies-house`));
  });

  describe('Visiting page for the first time', () => {
    it('displays the correct headings', () => {
      companiesHouse.captionHeading();
      companiesHouse.mainHeading();
      companiesHouse.backLink();
      companiesHouse.form();
      companiesHouse.regNumberField();
      companiesHouse.continueButton();
      companiesHouse.cancelLink();
      companiesHouse.summaryDetails();
    });
  });

  describe('Clicking on Back link', () => {
    it('takes you to application page', () => {
      companiesHouse.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
    });
  });

  describe('Clicking on Cancel button', () => {
    it('takes you to application page', () => {
      companiesHouse.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no characters have been entered', () => {
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('shows error message if registration number doesnt exist', () => {
      companiesHouse.regNumberField().type('abcc');
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('takes user to `exporters address` page if company registration number exists', () => {
      companiesHouse.regNumberField().type('06388542'); // HSBC company number
      companiesHouse.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}/exporters-address`));
    });
  });

  describe('Status query is set to `change`', () => {
    it('hides `back button`', () => {
      cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}/companies-house?status=change`));
      companiesHouse.backLink().should('not.exist');
    });

    it('redirects user back to application details page when clicking on `Continue` button', () => {
      cy.visit(relative(`/gef/application-details/${dealWithEmptyExporter._id}/companies-house?status=change`));
      companiesHouse.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}`));
    });
  });
});

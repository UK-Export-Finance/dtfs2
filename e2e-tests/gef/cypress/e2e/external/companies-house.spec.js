import relative from '../relativeURL';
import companiesHouse from '../pages/companies-house';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { DEAL_STATUS, COMPANIES_HOUSE_NUMBERS } from '../../fixtures/constants';

let dealWithEmptyExporter;
let companiesHouseUrl;

context('Companies House Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealWithEmptyExporter = body.items.find((deal) => {
          companiesHouseUrl = relative(`/gef/application-details/${deal._id}/companies-house`);
          return deal.exporter.status === DEAL_STATUS.IN_PROGRESS;
        });
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(companiesHouseUrl);
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

    it('shows error message if registration number does not exist', () => {
      companiesHouse.regNumberField().type('mock');
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('shows error message if registration number is too short', () => {
      companiesHouse.regNumberField().clear().type(COMPANIES_HOUSE_NUMBERS.INVALID_TOO_SHORT);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('shows error message if registration number has a space', () => {
      companiesHouse.regNumberField().clear().type(COMPANIES_HOUSE_NUMBERS.INVALID_WITH_SPACE);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('shows error message if registration number has a special character', () => {
      companiesHouse.regNumberField().clear().type(COMPANIES_HOUSE_NUMBERS.INVALID_SPECIAL_CHARACTERS);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.regNumberFieldError().should('be.visible');
    });

    it('takes user to `exporters address` page if company registration number exists', () => {
      companiesHouse.regNumberField().clear().type(COMPANIES_HOUSE_NUMBERS.VALID); // HSBC company number
      companiesHouse.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealWithEmptyExporter._id}/exporters-address`));
    });

    it('takes user to `exporters address` page if company registration number exists', () => {
      cy.visit(companiesHouseUrl);
      companiesHouse.regNumberField().clear().type(COMPANIES_HOUSE_NUMBERS.VALID_WITH_LETTERS);
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

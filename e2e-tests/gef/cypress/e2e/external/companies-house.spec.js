import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';
import relative from '../relativeURL';
import companiesHouse from '../pages/companies-house';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { DEAL_STATUS } from '../../fixtures/constants';

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
    it('shows the correct error message if no characters have been entered', () => {
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'Enter a Companies House registration number');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'Enter a Companies House registration number');
    });

    it('shows the correct error message if the registration number is too short', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'Enter a valid Companies House registration number');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'Enter a valid Companies House registration number');
    });

    it('shows the correct error message if the registration number is too long', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_LONG);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'Enter a valid Companies House registration number');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'Enter a valid Companies House registration number');
    });

    it('shows the correct error message if the registration number has a special character', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPECIAL_CHARACTER);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'Enter a valid Companies House registration number');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'Enter a valid Companies House registration number');
    });

    it('shows the correct error message if the registration number has a space', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPACE);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'Enter a valid Companies House registration number');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'Enter a valid Companies House registration number');
    });

    it('shows the correct error message if the registration number is valid but does not exist', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_NONEXISTENT);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'No company matching the Companies House registration number entered was found');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'No company matching the Companies House registration number entered was found');
    });

    it('shows the correct error message if the registration number is for an overseas company', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_OVERSEAS);
      companiesHouse.continueButton().click();
      companiesHouse.errorSummary().should('be.visible');
      companiesHouse.errorSummary().should('contain', 'UKEF can only process applications from companies based in the UK');
      companiesHouse.regNumberFieldError().should('be.visible');
      companiesHouse.regNumberFieldError().should('contain', 'UKEF can only process applications from companies based in the UK');
    });

    it('takes user to `exporters address` page if company registration number exists', () => {
      companiesHouse.regNumberField().clear().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
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

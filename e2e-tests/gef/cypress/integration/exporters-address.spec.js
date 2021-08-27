/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import exportersAddress from './pages/exporters-address';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;

context('Exporters Address Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(CREDENTIALS.MAKER);


    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/exporters-address`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      exportersAddress.backLink();
      exportersAddress.headingCaption();
      exportersAddress.mainHeading();
      exportersAddress.companyNameTitle();
      exportersAddress.registeredCompanyAddressTitle();
      exportersAddress.changeDetails();
      exportersAddress.yesRadioButton();
      exportersAddress.noRadioButton();
    });

    it('redirects user to companies house page when clicking on Back Link', () => {
      exportersAddress.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/companies-house`));
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no radio button has been selected', () => {
      exportersAddress.continueButton().click();
      exportersAddress.errorSummary();
      exportersAddress.fieldError();
    });

    it('redirects user to About exporter page if they select the No radio button', () => {
      exportersAddress.noRadioButton().click();
      exportersAddress.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/about-exporter`));
    });

    it('shows error message if user doesn`t fill in postcode', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().should('be.visible');
      exportersAddress.continueButton().click();
      exportersAddress.errorSummary();
      exportersAddress.postcodeError();
      exportersAddress.yesRadioButton().should('be.checked');
    });

    it('shows error message if user enter bad postcode and a valid manual address entry link', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().type('1');
      exportersAddress.continueButton().click();
      exportersAddress.postcodeError();
      exportersAddress.manualAddressEntryLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`));
    });

    xit('redirects user to Select exporters correspondence address page if form filled in correctly', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().type('E1 6JE');
      exportersAddress.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/select-exporters-correspondence-address`));
    });
  });
});

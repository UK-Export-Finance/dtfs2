import relative from '../relativeURL';
import { backLink, errorSummary, headingCaption, mainHeading } from '../partials';
import exportersAddress from '../pages/exporters-address';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { POSTCODE } from '../../fixtures/constants';

let dealId;

context('Exporters Address Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/exporters-address`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      backLink();
      headingCaption();
      mainHeading();
      exportersAddress.companyNameTitle();
      exportersAddress.registeredCompanyAddressTitle();
      exportersAddress.changeDetails();
      exportersAddress.yesRadioButton();
      exportersAddress.noRadioButton();
    });

    it('redirects user to companies house page when clicking on Back Link', () => {
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/companies-house`));
    });
  });

  describe('The separate correspondence address', () => {
    it('does not display if no radio button has been selected', () => {
      exportersAddress.correspondenceAddress().should('not.be.visible');
    });

    it('does not display if the user selects the No radio button', () => {
      exportersAddress.noRadioButton().click();
      exportersAddress.correspondenceAddress().should('not.be.visible');
    });

    it('does not display if the user selects the Yes radio button then the No radio button', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.noRadioButton().click();
      exportersAddress.correspondenceAddress().should('not.be.visible');
    });

    it('does display if the user selects the Yes radio button', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().should('be.visible');
    });

    it('does display if the user selects the No radio button then the Yes radio button', () => {
      exportersAddress.noRadioButton().click();
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().should('be.visible');
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no radio button has been selected', () => {
      cy.clickContinueButton();
      errorSummary();
      exportersAddress.fieldError();
    });

    it('redirects user to About exporter page if they select the No radio button', () => {
      exportersAddress.noRadioButton().click();
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/about-exporter`));
    });

    it('shows error message if user doesn`t fill in postcode', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().should('be.visible');
      cy.clickContinueButton();
      errorSummary();
      exportersAddress.postcodeError();
      exportersAddress.yesRadioButton().should('be.checked');
    });

    it('shows error message if user enter bad postcode and a valid manual address entry link', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().type('1');
      cy.clickContinueButton();
      exportersAddress.postcodeError();
      exportersAddress.manualAddressEntryLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/enter-exporters-correspondence-address`));
    });

    it('redirects user to Select exporters correspondence address page if form filled in correctly', () => {
      exportersAddress.yesRadioButton().click();
      exportersAddress.correspondenceAddress().type(POSTCODE.VALID);
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/select-exporters-correspondence-address`));
    });
  });
});

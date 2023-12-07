import relative from './relativeURL';
import exportersAddress from './pages/exporters-address';
import selectExportersCorAddress from './pages/select-exporters-corr-address';
import { BANK1_MAKER1 } from '../../../e2e-fixtures/portal-users.fixture';

let dealId;

context('Select Exporters Correspondence Address Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/exporters-address`));
    exportersAddress.yesRadioButton().click();
    exportersAddress.correspondenceAddress().type('E1 6JE');
    exportersAddress.continueButton().click();
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      selectExportersCorAddress.backLink();
      selectExportersCorAddress.headingCaption();
      selectExportersCorAddress.mainHeading();
      selectExportersCorAddress.postcodeTitle();
      selectExportersCorAddress.postcode();
      selectExportersCorAddress.form();
      selectExportersCorAddress.selectAddress();
      selectExportersCorAddress.cantFindAddress();
      selectExportersCorAddress.continueButton();
      selectExportersCorAddress.changeLink();
    });

    it('redirects user to exporters address page when clicking on `Back` Link', () => {
      selectExportersCorAddress.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/exporters-address`));
    });

    it('redirects user to exporters address page when clicking on `Change` link', () => {
      selectExportersCorAddress.changeLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/exporters-address`));
    });

    it('redirects user to enter-exporters-correspondence-address page when clicking on `I cant find the address in the list` link', () => {
      selectExportersCorAddress.cantFindAddress().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/enter-exporters-correspondence-address`));
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no address has been selected from dropdown', () => {
      selectExportersCorAddress.continueButton().click();
      selectExportersCorAddress.errorSummary();
      selectExportersCorAddress.selectAddressError();
    });

    it('redirects user to enter exporters correspondence address page if they select an address', () => {
      selectExportersCorAddress.selectAddress().select('0');
      selectExportersCorAddress.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/enter-exporters-correspondence-address`));
    });
  });
});

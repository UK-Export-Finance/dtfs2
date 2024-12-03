import relative from '../relativeURL';
import { backLink, errorSummary, headingCaption, mainHeading, form, continueButton, saveAndReturnButton } from '../partials';
import enterExportersCorAddress from '../pages/enter-exporters-corr-address';
import applicationDetails from '../pages/application-details';
import exportersAddress from '../pages/exporters-address';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import { POSTCODE } from '../../fixtures/constants';

let dealIds = [];
let token;

context('Enter Exporters Correspondence Address Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push({ id: item._id, exporterId: item.exporterId });
        });
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address`), {
      headers: { Referer: relative(`/gef/application-details/${dealIds[0].id}`) },
    });
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      backLink();
      headingCaption();
      mainHeading();
      form();
      enterExportersCorAddress.addressLine1();
      enterExportersCorAddress.addressLine2();
      enterExportersCorAddress.addressLine3();
      enterExportersCorAddress.locality();
      enterExportersCorAddress.postcode();
      continueButton();
      saveAndReturnButton();
    });

    it('redirects user to select exporters address page when clicking on `Back` Link', () => {
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}`));
    });

    it('redirects user to select exporters address page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0].id}/exporters-address`));
      exportersAddress.yesRadioButton().click();
      cy.keyboardInput(exportersAddress.correspondenceAddress(), POSTCODE.INVALID);
      cy.clickContinueButton();
      exportersAddress.postcodeError();
      exportersAddress.manualAddressEntryLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address`));
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}`));
    });

    it('pre-populates form with address', () => {
      cy.apiLogin(BANK1_MAKER1)
        .then((tok) => {
          token = tok;
        })
        .then(() => cy.apiFetchAllGefApplications(token))
        .then(({ body }) => {
          dealIds = [];
          body.items.forEach((item) => {
            dealIds.push({ id: item._id, exporterId: item.exporterId });
          });
        })
        .then(() => {
          const dealUpdate = {
            exporter: {
              correspondenceAddress: {
                addressLine1: 'Line 1',
                addressLine2: 'Line 2',
                addressLine3: 'Line 3',
              },
            },
          };

          cy.apiUpdateApplication(dealIds[1].id, token, dealUpdate);
        });
      cy.login(BANK1_MAKER1);

      cy.visit(relative(`/gef/application-details/${dealIds[1].id}/enter-exporters-correspondence-address`));
      enterExportersCorAddress.addressLine1().should('have.value', 'Line 1');
      enterExportersCorAddress.addressLine2().should('have.value', 'Line 2');
      enterExportersCorAddress.addressLine3().should('have.value', 'Line 3');
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no address has been selected from dropdown', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address`));
      cy.clickContinueButton();
      errorSummary();
      enterExportersCorAddress.addressLine1Error();
      enterExportersCorAddress.postcodeError();
    });

    describe('if form has been filled in correctly', () => {
      it('takes user to about export page ', () => {
        cy.keyboardInput(enterExportersCorAddress.addressLine1(), 'Line 1');
        cy.keyboardInput(enterExportersCorAddress.addressLine2(), 'Line 2');
        cy.keyboardInput(enterExportersCorAddress.addressLine3(), 'Line 3');
        cy.keyboardInput(enterExportersCorAddress.locality(), 'Locality');
        cy.keyboardInput(enterExportersCorAddress.postcode(), 'Postcode');
        cy.clickContinueButton();
        cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}/about-exporter`));
      });

      it('defaults and shows country as United Kingdom', () => {
        cy.visit(`/gef/application-details/${dealIds[0].id}`);
        applicationDetails.exporterSummaryList().should('contain', 'United Kingdom');
      });
    });
  });

  describe('Clicking on Save and return button', () => {
    it('bypasses validation and takes user back to application details page', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address`));
      cy.clickSaveAndReturnButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}`));
    });
  });

  describe('Status query is set to `change`', () => {
    it('hides `back button`', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address?status=change`));
      backLink().should('not.exist');
    });

    it('redirects user back to application details page when clicking on `Continue` button', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0].id}/enter-exporters-correspondence-address?status=change`));
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0].id}`));
    });
  });
});

import relative from '../../relativeURL';
import { backLink, cancelLink, continueButton, form, errorSummary, headingCaption } from '../../partials';
import facilities from '../../pages/facilities';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import CONSTANTS from '../../../fixtures/constants';

const dealIds = [];
let token;

context('Facilities Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Visiting facility page', () => {
    it('displays the correct elements for cash facility', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      backLink();
      headingCaption();
      facilities.hasBeenIssuedHeading().contains('cash');
      form();
      facilities.hasBeenIssuedRadioYesRadioButton();
      facilities.hasBeenIssuedRadioNoRadioButton();
      continueButton();
      cancelLink();
    });

    it('displays the correct elements for contingent facility', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities?facilityType=${CONSTANTS.FACILITY_TYPE.CONTINGENT}`));
      backLink();
      headingCaption();
      facilities.hasBeenIssuedHeading().contains('contingent');
      form();
      facilities.hasBeenIssuedRadioYesRadioButton();
      facilities.hasBeenIssuedRadioNoRadioButton();
      continueButton();
      cancelLink();
    });

    it('redirects user back to application details page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0]}`));
    });

    it('redirects user back to application details page when clicking on `Cancel` Link', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      cy.clickCancelLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0]}`));
    });
  });

  describe('Clicking on Continue button', () => {
    it('validates form', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      cy.clickContinueButton();
      facilities.hasBeenIssuedHeading().contains('Has your bank already issued this cash facility to the exporter?');
      errorSummary().contains('Select if your bank has already issued this cash facility');
      facilities.hasBeenIssuedError().contains('Select if your bank has already issued this cash facility');
    });

    it('takes you to `about facility` page when selecting one of the radio buttons', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.hasBeenIssuedRadioYesRadioButton().click();
      cy.clickContinueButton();
      Cypress.minimatch('/gef/application-details/123/facilities/1234/about-facility', '/gef/application-details/*/facilities/*/about-facility', {
        matchBase: true,
      });
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.hasBeenIssuedRadioNoRadioButton().click();
      cy.clickContinueButton();
      Cypress.minimatch('/gef/application-details/123/facilities/1234/about-facility', '/gef/application-details/*/facilities/*/about-facility', {
        matchBase: true,
      });
    });
  });
});

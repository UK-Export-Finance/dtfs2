import relative from './relativeURL';
import facilities from './pages/facilities';
import CREDENTIALS from '../fixtures/credentials.json';
import CONSTANTS from '../fixtures/constants';

const dealIds = [];
let token;

context('Facilities Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting facility page', () => {
    it('displays the correct elements for cash faciltiy', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.backLink();
      facilities.headingCaption();
      facilities.hasBeenIssuedHeading().contains('cash');
      facilities.form();
      facilities.hasBeenIssuedRadioYesRadioButton();
      facilities.hasBeenIssuedRadioNoRadioButton();
      facilities.continueButton();
      facilities.cancelLink();
    });

    it('displays the correct elements for contingent faciltiy', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities?facilityType=${CONSTANTS.FACILITY_TYPE.CONTINGENT}`));
      facilities.backLink();
      facilities.headingCaption();
      facilities.hasBeenIssuedHeading().contains('contingent');
      facilities.form();
      facilities.hasBeenIssuedRadioYesRadioButton();
      facilities.hasBeenIssuedRadioNoRadioButton();
      facilities.continueButton();
      facilities.cancelLink();
    });

    it('redirects user back to application details page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0]}`));
    });

    it('redirects user back to application details page when clicking on `Cancel` Link', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.cancelLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[0]}`));
    });
  });

  describe('Clicking on Continue button', () => {
    it('validates form', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.continueButton().click();
      facilities.hasBeenIssuedHeading().contains('Has your bank already issued this cash facility to the exporter?');
      facilities.errorSummary().contains('Select if your bank has already issued this cash facility');
      facilities.hasBeenIssuedError().contains('Select if your bank has already issued this cash facility');
    });

    it('takes you to `about facility` page when selecting one of the radio buttons', () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.hasBeenIssuedRadioYesRadioButton().click();
      facilities.continueButton().click();
      Cypress.minimatch('/gef/application-details/123/facilities/1234/about-facility', '/gef/application-details/*/facilities/*/about-facility', {
        matchBase: true,
      });
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/facilities`));
      facilities.hasBeenIssuedRadioNoRadioButton().click();
      facilities.continueButton().click();
      Cypress.minimatch('/gef/application-details/123/facilities/1234/about-facility', '/gef/application-details/*/facilities/*/about-facility', {
        matchBase: true,
      });
    });
  });
});

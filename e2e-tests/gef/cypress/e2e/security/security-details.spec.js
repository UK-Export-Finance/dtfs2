import relative from '../relativeURL';
import { cancelButton, errorSummary, form, mainHeading, submitButton } from '../partials';
import securityDetails from '../pages/security-details';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let dealId;
let token;

context('Security Details Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllGefApplications(token))
      .then(({ body }) => {
        dealId = body.items[2]._id;
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      securityDetails.visit(dealId);
      mainHeading();
      form();
      securityDetails.exporterSecurity();
      securityDetails.facilitySecurity();
      submitButton();
      cancelButton();
    });

    it('shows error message when security details have been entered', () => {
      securityDetails.visit(dealId);
      cy.clickSubmitButton();
      errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.facilitySecurityError();
    });

    it('shows error message when security details are too long', () => {
      const longString = new Array(402).join('t');

      securityDetails.visit(dealId);
      cy.keyboardInput(securityDetails.exporterSecurity(), longString);
      cy.keyboardInput(securityDetails.facilitySecurity(), longString);
      cy.clickSubmitButton();
      errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.facilitySecurityError();
    });

    it('shows error message when security details are invalid format', () => {
      const invalidString = 'This text @ is not %()~# valid';

      securityDetails.visit(dealId);
      cy.keyboardInput(securityDetails.exporterSecurity(), invalidString);
      cy.keyboardInput(securityDetails.facilitySecurity(), invalidString);
      cy.clickSubmitButton();
      errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.facilitySecurityError();
    });

    it('takes you to `Application details` page when clicking on `Continue` button', () => {
      securityDetails.visit(dealId);
      cy.keyboardInput(securityDetails.exporterSecurity(), 'Valid security details');
      cy.keyboardInput(securityDetails.facilitySecurity(), 'Valid security details');
      cy.clickSubmitButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('redirects user to application page when clicking on `Return to application` button', () => {
      securityDetails.visit(dealId);
      cy.clickCancelButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });
  });
});

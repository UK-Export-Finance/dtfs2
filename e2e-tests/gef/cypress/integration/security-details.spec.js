import relative from './relativeURL';
import securityDetails from './pages/security-details';
import CREDENTIALS from '../fixtures/credentials.json';

let dealId;
let token;

context('Security Details Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        dealId = body.items[2]._id;
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      securityDetails.visit(dealId);
      securityDetails.mainHeading();
      securityDetails.form();
      securityDetails.exporterSecurity();
      securityDetails.facilitySecurity();
      securityDetails.continueButton();
      securityDetails.cancelButton();
    });

    it('shows error message when security details have been entered', () => {
      securityDetails.visit(dealId);
      securityDetails.continueButton().click();
      securityDetails.errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.applicationSecurityError();
    });

    it('shows error message when security details are too long', () => {
      const longString = new Array(402).join('t');

      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type(longString);
      securityDetails.facilitySecurity().type(longString);
      securityDetails.continueButton().click();
      securityDetails.errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.applicationSecurityError();
    });

    it('shows error message when security details are invalid format', () => {
      const invalidString = 'This text @ is not %()~# valid';

      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type(invalidString);
      securityDetails.facilitySecurity().type(invalidString);
      securityDetails.continueButton().click();
      securityDetails.errorSummary();
      securityDetails.exporterSecurityError();
      securityDetails.applicationSecurityError();
    });

    it('takes you to `Application details` page when clicking on `Continue` button', () => {
      securityDetails.visit(dealId);
      securityDetails.exporterSecurity().type('Valid security details');
      securityDetails.facilitySecurity().type('Valid security details');
      securityDetails.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('redirects user to application page when clicking on `Return to application` button', () => {
      securityDetails.visit(dealId);
      securityDetails.cancelButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });
  });
});

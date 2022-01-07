import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import nameApplication from './pages/name-application';
import CREDENTIALS from '../fixtures/credentials.json';

context('Name Application Page', () => {
  let applications;

  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applications = body.items;
      });

    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    mandatoryCriteria.form().submit();
  });

  describe('Visiting initial page', () => {
    it('displays the header', () => {
      nameApplication.mainHeading();
    });

    it('displays correct form fields', () => {
      nameApplication.internalRef();
      nameApplication.additionalRef();
      nameApplication.continueButton();
      nameApplication.cancelButton();
    });
  });

  describe('Filling in form', () => {
    it('shows error summary at top of page when fields have been left blank', () => {
      nameApplication.form().submit();
      nameApplication.errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      nameApplication.form().submit();
      nameApplication.errorSummary();
      nameApplication.firstErrorLink().click();
      cy.url().should('eq', relative('/gef/name-application'));
    });

    it('Entering new Bank internal ref takes you application detail page', () => {
      nameApplication.internalRef().type('NEW-REF-NAME');
      nameApplication.form().submit();
      nameApplication.applicationDetailsPage();
    });
  });

  describe('Updating values', () => {
    beforeEach(() => {
      cy.visit(relative(`/gef/applications/${applications[0]._id}/name`));
    });

    it('shows error summary at top of page when fields are invalid', () => {
      nameApplication.internalRef().clear();
      nameApplication.form().submit();
      nameApplication.errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      nameApplication.internalRef().clear();
      nameApplication.form().submit();
      nameApplication.errorSummary();
      nameApplication.firstErrorLink().click();
      cy.url().should('eq', relative(`/gef/applications/${applications[0]._id}/name`));
    });

    it('Entering new Bank internal ref takes you application detail page', () => {
      nameApplication.internalRef().type('NEW-REF-NAME');
      nameApplication.form().submit();
      nameApplication.applicationDetailsPage();
    });
  });

  describe('Clicking on Abandon', () => {
    it('takes the user back to the dashboard', () => {
      nameApplication.cancelButton().click();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});

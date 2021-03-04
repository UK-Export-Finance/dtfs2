/* eslint-disable no-undef */
import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import nameApplication from './pages/name-application';

context('Name Application Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.fixture('credentials')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    mandatoryCriteria.form().submit();
  });

  describe('Visiting page', () => {
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
      nameApplication.internalRef().type('NEW_REF_NAME');
      nameApplication.form().submit();
      nameApplication.applicationDetailsPage();
    });

    it('Entering the same Bank internal ref shows a error to the user', () => {
      nameApplication.internalRef().type('NEW_REF_NAME');
      nameApplication.form().submit();
      nameApplication.errorSummary();
      nameApplication.applicationDetailsPage().should('not.exist');
    });
  });

  describe('Clicking on Cancel', () => {
    it('keeps the user on the same page FOR NOW', () => {
      nameApplication.cancelButton().click();
      cy.url().should('eq', relative('/gef/name-application'));
    });
  });
});

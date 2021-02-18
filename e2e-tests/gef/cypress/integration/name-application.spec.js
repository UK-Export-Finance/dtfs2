/* eslint-disable no-undef */
import relative from './relativeURL';
import nameApplication from './pages/name-application';

context('Name Application Page', () => {
  before(() => {
    cy.fixture('login')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/name-application'));
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

  // describe('Clicking on Continue', () => {
  //   it('shows error summary at top of page when no radio button has been selected', () => {
  //     nameApplication.form().submit();
  //     nameApplication.errorSummary();
  //   });

  //   it('Clicking on error link in error summary takes you to correct field', () => {
  //     nameApplication.form().submit();
  //     nameApplication.errorSummary();
  //     nameApplication.firstErrorLink().click();
  //     cy.url().should('eq', relative('/gef/mandatory-criteria'));
  //   });

  //   it('shows validation error when no radio button has been selected', () => {
  //     nameApplication.form().submit();
  //     nameApplication.formError();
  //   });

  //   it('redirects the user to ineligible page when they select `False`', () => {
  //     nameApplication.falseRadio().click();
  //     nameApplication.form().submit();
  //     cy.url().should('eq', relative('/gef/ineligible'));
  //   });

  //   it('redirects the user to the Name Application page when they select `True`', () => {
  //     nameApplication.trueRadio().click();
  //     nameApplication.form().submit();
  //     cy.url().should('eq', relative('/gef/name-application'));
  //   });
  // });

  // describe('Clicking on Cancel', () => {
  //   it('keeps the user on the same page FOR NOW', () => {
  //     nameApplication.cancelButton().click();
  //     cy.url().should('eq', relative('/gef/mandatory-criteria'));
  //   });
  // });
});

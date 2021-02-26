/* eslint-disable no-undef */
import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';

context('Mandatory Criteria Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.fixture('login')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/mandatory-criteria'));
  });

  describe('Visiting page', () => {
    it('displays the header', () => {
      mandatoryCriteria.captionHeading();
      mandatoryCriteria.mainHeading();
    });

    it('displays the mandatory criteria text', () => {
      mandatoryCriteria.mandatoryCriteriaText();
    });
  });

  describe('Clicking on Continue', () => {
    it('shows error summary at top of page when no radio button has been selected', () => {
      mandatoryCriteria.form().submit();
      mandatoryCriteria.errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      mandatoryCriteria.form().submit();
      mandatoryCriteria.errorSummary();
      mandatoryCriteria.firstErrorLink().click();
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });

    it('shows validation error when no radio button has been selected', () => {
      mandatoryCriteria.form().submit();
      mandatoryCriteria.formError();
    });

    it('redirects the user to ineligible page when they select `False`', () => {
      mandatoryCriteria.falseRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/ineligible'));
    });

    it('redirects the user to the Name Application page when they select `True`', () => {
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/name-application'));
    });
  });

  describe('Clicking on Cancel', () => {
    it('keeps the user on the same page FOR NOW', () => {
      mandatoryCriteria.cancelButton().click();
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });
  });
});

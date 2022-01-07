import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import CREDENTIALS from '../fixtures/credentials.json';

context('Mandatory Criteria Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.login(CREDENTIALS.MAKER);
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
      cy.url().should('eq', relative('/gef/ineligible-gef'));
    });

    it('redirects the user to the Name Application page when they select `True`', () => {
      mandatoryCriteria.trueRadio().click();
      mandatoryCriteria.form().submit();
      cy.url().should('eq', relative('/gef/name-application'));
    });
  });

  describe('Clicking on Abandon', () => {
    it('takes the user back to the dashboard', () => {
      mandatoryCriteria.cancelButton().click();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});

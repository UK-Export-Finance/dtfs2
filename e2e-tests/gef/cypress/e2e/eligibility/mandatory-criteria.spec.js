import relative from '../relativeURL';
import { errorSummary, form, headingCaption, mainHeading } from '../partials';
import mandatoryCriteria from '../pages/mandatory-criteria';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Mandatory Criteria Page', () => {
  before(() => {
    cy.loadData();
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative('/gef/mandatory-criteria'));
  });

  describe('Visiting page', () => {
    it('displays the header', () => {
      headingCaption();
      mainHeading();
    });

    it('displays the mandatory criteria text', () => {
      mandatoryCriteria.mandatoryCriteriaText();
    });
  });

  describe('Clicking on Continue', () => {
    it('shows error summary at top of page when no radio button has been selected', () => {
      form().submit();
      errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      form().submit();
      errorSummary();
      mandatoryCriteria.firstErrorLink().click();
      cy.url().should('eq', relative('/gef/mandatory-criteria'));
    });

    it('shows validation error when no radio button has been selected', () => {
      form().submit();
      mandatoryCriteria.formError();
    });

    it('redirects the user to ineligible page when they select `False`', () => {
      mandatoryCriteria.falseRadio().click();
      form().submit();
      cy.url().should('eq', relative('/gef/ineligible-gef'));
    });

    it('redirects the user to the Name Application page when they select `True`', () => {
      mandatoryCriteria.trueRadio().click();
      form().submit();
      cy.url().should('eq', relative('/gef/name-application'));
    });
  });

  describe('Clicking on Abandon', () => {
    it('takes the user back to the dashboard', () => {
      cy.clickCancelButton();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});

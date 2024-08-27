import relative from '../relativeURL';
import { continueButton, errorSummary, form, mainHeading } from '../partials';
import mandatoryCriteria from '../pages/mandatory-criteria';
import nameApplication from '../pages/name-application';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Name Application Page', () => {
  let applications;

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        applications = body.items;
      });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    form().submit();
  });

  describe('Visiting initial page', () => {
    it('displays the header', () => {
      mainHeading();
    });

    it('displays correct form fields', () => {
      nameApplication.internalRef();
      nameApplication.additionalRef();
      continueButton();
      nameApplication.cancelButton();
    });
  });

  describe('Filling in form', () => {
    it('shows error summary at top of page when fields have been left blank', () => {
      form().submit();
      errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      form().submit();
      errorSummary();
      nameApplication.firstErrorLink().click();
      cy.url().should('eq', relative('/gef/name-application'));
    });

    it('Entering new Bank internal ref takes you application detail page', () => {
      nameApplication.internalRef().type('NEW-REF-NAME');
      form().submit();
      nameApplication.applicationDetailsPage();
    });
  });

  describe('Updating values', () => {
    beforeEach(() => {
      cy.visit(relative(`/gef/applications/${applications[0]._id}/name`));
    });

    it('shows error summary at top of page when fields are invalid', () => {
      nameApplication.internalRef().clear();
      form().submit();
      errorSummary();
    });

    it('Clicking on error link in error summary takes you to correct field', () => {
      nameApplication.internalRef().clear();
      form().submit();
      errorSummary();
      nameApplication.firstErrorLink().click();
      cy.url().should('eq', relative(`/gef/applications/${applications[0]._id}/name`));
    });

    it('Entering new Bank internal ref takes you application detail page', () => {
      nameApplication.internalRef().type('NEW-REF-NAME');
      form().submit();
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

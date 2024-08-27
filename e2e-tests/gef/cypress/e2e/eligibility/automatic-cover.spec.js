import relative from '../relativeURL';
import { continueButton, errorSummary, form, mainHeading, saveAndReturnButton } from '../partials';
import automaticCover from '../pages/automatic-cover';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let dealId;

context('Automatic Cover Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/automatic-cover`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      mainHeading();
      form();
      automaticCover.automaticCoverTerm(12).should('exist');
      continueButton();
      saveAndReturnButton();
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows errors if no radio button has been selected', () => {
      cy.clickContinueButton();
      errorSummary();
      automaticCover.fieldError();
      automaticCover.automaticCoverTerm(12).should('exist');
    });

    it('removes error message from field if a radio button has been selected', () => {
      automaticCover.trueRadioButton(12).click();
      cy.clickContinueButton();
      automaticCover.automaticCoverTerm(12).siblings('[data-cy="automatic-cover-error"]').should('not.exist');
    });

    it('takes user to `not eligible for automatic cover` page if at least 1 FALSE field has been selected', () => {
      cy.manualEligibilityCriteria();
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
    });

    it('takes user to `eligible for automatic cover` page if all true fields have been selected', () => {
      cy.automaticEligibilityCriteria();
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/eligible-automatic-cover`));
    });

    it('takes user to `automatic application details` page if they click on the save and return button', () => {
      saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });
  });
});

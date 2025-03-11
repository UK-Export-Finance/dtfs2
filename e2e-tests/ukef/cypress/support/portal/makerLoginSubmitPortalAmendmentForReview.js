import whatDoYouNeedToChange from '../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../gef/cypress/e2e/pages/amendments/eligibility';
import submittedForChecking from '../../../../gef/cypress/e2e/pages/amendments/submitted-for-checking';
import facilityValue from '../../../../gef/cypress/e2e/pages/amendments/facility-value';

/**
 * Submit a portal amendment for review
 * @param {string} amendmentUrl
 * @param {Boolean} coverEndDateExist
 * @param {Boolean} facilityValueExist
 * @param {Boolean} facilityEndDateExist
 */
export const makerLoginSubmitPortalAmendmentForReview = (coverEndDateExist = '', facilityValueExist = '', facilityEndDateExist = '') => {
  if (coverEndDateExist) {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
  }
  if (facilityValueExist) {
    whatDoYouNeedToChange.facilityValueCheckbox().click();
  }
  cy.clickContinueButton();

  if (coverEndDateExist) {
    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    if (facilityEndDateExist) {
      doYouHaveAFacilityEndDate.yesRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'facility-end-date' });
      cy.clickContinueButton();
    } else {
      doYouHaveAFacilityEndDate.noRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
      cy.clickContinueButton();
    }
    cy.clickContinueButton();
  }

  if (facilityValueExist) {
    cy.keyboardInput(facilityValue.facilityValue(), '10000');
    cy.clickContinueButton();
  }

  eligibility.allTrueRadioButtons().click({ multiple: true });
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'effective-date' });
  cy.clickContinueButton();
  cy.clickSubmitButton();

  submittedForChecking.returnLink().click();
};

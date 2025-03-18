import whatDoYouNeedToChange from '../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../gef/cypress/e2e/pages/amendments/eligibility';
import submittedForChecking from '../../../../gef/cypress/e2e/pages/amendments/submitted-for-checking';
import facilityValue from '../../../../gef/cypress/e2e/pages/amendments/facility-value';

/**
 * Submit a portal amendment for review
 * @param {Boolean} coverEndDateExist
 * @param {Boolean} facilityValueExist
 * @param {Boolean} facilityEndDateExist
 */
export const makerSubmitPortalAmendmentForReview = (coverEndDateExists = false, facilityValueExists = false, facilityEndDateExists = false) => {
  if (coverEndDateExists) {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
  }

  if (facilityValueExists) {
    whatDoYouNeedToChange.facilityValueCheckbox().click();
  }

  cy.clickContinueButton();

  if (coverEndDateExists) {
    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    if (facilityEndDateExists) {
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

  if (facilityValueExists) {
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

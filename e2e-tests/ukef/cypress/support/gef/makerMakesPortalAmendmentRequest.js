import whatDoYouNeedToChange from '../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import eligibility from '../../../../gef/cypress/e2e/pages/amendments/eligibility';
import facilityValue from '../../../../gef/cypress/e2e/pages/amendments/facility-value';
import { today } from '../../../../e2e-fixtures/dateConstants';
/**
 * completes the maker makes portal amendment request journey up to check your answers
 * @param {Boolean} param.coverEndDateExists - if cover end date is changed
 * @param {Boolean} param.facilityValueExists - if facility value is changed
 * @param {Boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {String} param.changedFacilityValue - the new value for the facility
 * @param {String} param.changedCoverEndDate - the new cover end date
 */
export const makerMakesPortalAmendmentRequest = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
  changedCoverEndDate,
  effectiveDate = today.date,
}) => {
  if (coverEndDateExists) {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
  }

  if (facilityValueExists) {
    whatDoYouNeedToChange.facilityValueCheckbox().click();
  }

  cy.clickContinueButton();

  if (coverEndDateExists) {
    cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: changedCoverEndDate });
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
    cy.keyboardInput(facilityValue.facilityValue(), changedFacilityValue);
    cy.clickContinueButton();
  }

  eligibility.allTrueRadioButtons().click({ multiple: true });
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'effective-date', date: effectiveDate });
  cy.clickContinueButton();
};

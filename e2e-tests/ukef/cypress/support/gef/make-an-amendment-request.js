import whatDoYouNeedToChange from '../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityValue from '../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../gef/cypress/e2e/pages/amendments/eligibility';

export const makeAnAmendmentRequest = ({
  changeCoverEndDate = false,
  hasFacilityEndDate = false,
  changeFacilityValue = true,
  changedFacilityValue,
  shouldSubmit = false,
}) => {
  if (changeCoverEndDate) {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
  }

  if (changeFacilityValue) {
    whatDoYouNeedToChange.facilityValueCheckbox().click();
  }

  cy.clickContinueButton();

  if (changeCoverEndDate) {
    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    if (hasFacilityEndDate) {
      doYouHaveAFacilityEndDate.yesRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'facility-end-date' });
    } else {
      doYouHaveAFacilityEndDate.noRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
    }
    cy.clickContinueButton();
  }

  cy.keyboardInput(facilityValue.facilityValue(), changedFacilityValue);
  cy.clickContinueButton();

  eligibility.allTrueRadioButtons().click({ multiple: true });
  cy.clickContinueButton();

  cy.completeDateFormFields({ idPrefix: 'effective-date' });
  cy.clickContinueButton();

  if (shouldSubmit) {
    cy.clickSubmitButton();
  }
};

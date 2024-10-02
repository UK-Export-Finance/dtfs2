import { format } from 'date-fns';
import { today, todayDay, todayMonth, todayYear } from '../../../../../e2e-fixtures/dateConstants';

const amendmentsPage = require('../../../e2e/pages/amendments/amendmentsPage');
const facilityPage = require('../../../e2e/pages/facilityPage');

/**
 * Navigates to the is using facility end date page from the facility page
 * Entering current date as the amendment request date and effective date
 * @param {Object} [options = {}] - options for navigating to the is using facility end date page
 * @param {boolean} [options.startNewAmendment = false] - whether to start a new amendment request
 * @param {boolean} [options.changeFacilityValue = false] - whether to change the facility value
 * @param {Date} [options.newCoverEndDate = today] - the new cover end date
 */
const navigateToIsUsingFacilityEndDatePage = ({ startNewAmendment = false, changeFacilityValue = false, newCoverEndDate = today } = {}) => {
  facilityPage.facilityTabAmendments().click();

  if (startNewAmendment) {
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
  } else {
    cy.clickContinueButton();
  }

  cy.url().should('contain', 'request-date');
  cy.keyboardInput(amendmentsPage.amendmentRequestDayInput(), todayDay);
  cy.keyboardInput(amendmentsPage.amendmentRequestMonthInput(), todayMonth);
  cy.keyboardInput(amendmentsPage.amendmentRequestYearInput(), todayYear);
  cy.clickContinueButton();

  cy.url().should('contain', 'request-approval');
  amendmentsPage.amendmentRequestApprovalNo().check();
  cy.clickContinueButton();

  cy.url().should('contain', 'amendment-effective-date');
  cy.keyboardInput(amendmentsPage.amendmentEffectiveDayInput(), todayDay);
  cy.keyboardInput(amendmentsPage.amendmentEffectiveMonthInput(), todayMonth);
  cy.keyboardInput(amendmentsPage.amendmentEffectiveYearInput(), todayYear);
  cy.clickContinueButton();

  cy.url().should('contain', 'amendment-options');
  amendmentsPage.amendmentFacilityValueCheckbox().uncheck();
  if (changeFacilityValue) {
    amendmentsPage.amendmentFacilityValueCheckbox().check();
  }
  amendmentsPage.amendmentCoverEndDateCheckbox().check();
  cy.clickContinueButton();

  cy.url().should('contain', 'cover-end-date');
  cy.keyboardInput(amendmentsPage.amendmentCoverEndDateDayInput(), format(newCoverEndDate, 'd'));
  cy.keyboardInput(amendmentsPage.amendmentCoverEndDateMonthInput(), format(newCoverEndDate, 'M'));
  cy.keyboardInput(amendmentsPage.amendmentCoverEndDateYearInput(), format(newCoverEndDate, 'yyyy'));
  cy.clickContinueButton();

  cy.url().should('contain', 'is-using-facility-end-date');
};

export default navigateToIsUsingFacilityEndDatePage;

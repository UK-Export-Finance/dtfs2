import { format } from 'date-fns';
import { today, todayDay, todayMonth, todayYear } from '../../../../../e2e-fixtures/dateConstants';

const amendmentsPage = require('../../../e2e/pages/amendments/amendmentsPage');
const facilityPage = require('../../../e2e/pages/facilityPage');

/**
 * Navigates to the is using facility end date page from the facility page
 * Entering current date as the amendment request date and effective date
 * @param {object} [options = {}] - options for navigating to the is using facility end date page
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
    amendmentsPage.continueAmendmentButton().click();
  }

  cy.url().should('contain', 'request-date');
  amendmentsPage.amendmentRequestDayInput().clear().type(todayDay);
  amendmentsPage.amendmentRequestMonthInput().clear().type(todayMonth);
  amendmentsPage.amendmentRequestYearInput().clear().type(todayYear);
  cy.clickContinueButton();

  cy.url().should('contain', 'request-approval');
  amendmentsPage.amendmentRequestApprovalNo().check();
  cy.clickContinueButton();

  cy.url().should('contain', 'amendment-effective-date');
  amendmentsPage.amendmentEffectiveDayInput().clear().type(todayDay);
  amendmentsPage.amendmentEffectiveMonthInput().clear().type(todayMonth);
  amendmentsPage.amendmentEffectiveYearInput().clear().type(todayYear);
  cy.clickContinueButton();

  cy.url().should('contain', 'amendment-options');
  amendmentsPage.amendmentFacilityValueCheckbox().uncheck();
  if (changeFacilityValue) {
    amendmentsPage.amendmentFacilityValueCheckbox().check();
  }
  amendmentsPage.amendmentCoverEndDateCheckbox().check();
  cy.clickContinueButton();

  cy.url().should('contain', 'cover-end-date');
  amendmentsPage.amendmentCoverEndDateDayInput().clear().type(format(newCoverEndDate, 'd'));
  amendmentsPage.amendmentCoverEndDateMonthInput().clear().type(format(newCoverEndDate, 'M'));
  amendmentsPage.amendmentCoverEndDateYearInput().clear().type(format(newCoverEndDate, 'yyyy'));
  cy.clickContinueButton();

  cy.url().should('contain', 'is-using-facility-end-date');
};

export default navigateToIsUsingFacilityEndDatePage;

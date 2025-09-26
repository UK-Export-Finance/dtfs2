import { tomorrow } from '@ukef/dtfs2-common/test-helpers';
import applicationDetails from '../../e2e/pages/application-details';
import facilities from '../../e2e/pages/facilities';
import aboutFacility from '../../e2e/pages/about-facility';
import providedFacility from '../../e2e/pages/provided-facility';
import facilityCurrency from '../../e2e/pages/facility-currency';
import facilityValue from '../../e2e/pages/facility-value';
import facilityGuarantee from '../../e2e/pages/facility-guarantee';

/**
 * Creates a facility from the UI with the specified parameters
 * Returns the facility ID of the created facility
 * @param {boolean} isCashFacility - if cash or contingent facility to be created - default: true (cash)
 * @param {boolean} isIssued - if the facility has been issued - default: true (issued)
 * @param {string} monthsOfCover - number of months of cover - default: '5'
 * @param {boolean} isUsingFacilityEndDate - if using facility end date - default: false (not using)
 * @param {string} facilityEndDate - facility end date - default: tomorrow's date
 * @param {string} name - facility name - default: 'Name'
 * @returns {Promise} - A promise that returns the facility ID of the created facility
 */
export const createFacility = ({
  isCashFacility = true,
  isIssued = true,
  monthsOfCover = '5',
  isUsingFacilityEndDate = false,
  facilityEndDate = tomorrow.date,
  name = 'Name',
}) => {
  // completes the cash or contingent facility type section
  if (isCashFacility) {
    applicationDetails.addCashFacilityButton().click();
  } else {
    applicationDetails.addContingentFacilityButton().click();
  }

  // completes the has been issued section
  if (isIssued) {
    facilities.hasBeenIssuedRadioYesRadioButton().click();
  } else {
    facilities.hasBeenIssuedRadioNoRadioButton().click();
  }
  cy.clickContinueButton();

  cy.keyboardInput(aboutFacility.facilityName(), name);

  if (isIssued) {
    /**
     * if issued
     * cover starts on submission
     * and completes cover end date
     */
    aboutFacility.shouldCoverStartOnSubmissionYes().click();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: tomorrow.date });
  } else {
    // if not issued, needs to complete months of cover
    cy.keyboardInput(aboutFacility.monthsOfCover(), monthsOfCover);
  }

  if (isUsingFacilityEndDate) {
    /**
     * if using facility end date
     * completes facility end date form
     */
    aboutFacility.isUsingFacilityEndDateYes().click();

    cy.clickContinueButton();

    cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: facilityEndDate });

    cy.clickContinueButton();
  } else {
    /**
     * if not using facility end date
     * completes bank review date section
     */
    aboutFacility.isUsingFacilityEndDateNo().click();

    cy.clickContinueButton();

    cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: tomorrow.date });
    cy.clickContinueButton();
  }

  // completes provided facility section
  providedFacility.otherCheckbox().click();
  cy.keyboardInput(providedFacility.detailsOther(), 'some text here');
  cy.clickContinueButton();

  // completes facility currency and value sections
  facilityCurrency.yenCheckbox().click();
  cy.clickContinueButton();

  cy.keyboardInput(facilityValue.value(), '3000');
  cy.keyboardInput(facilityValue.percentageCover(), '80');
  cy.keyboardInput(facilityValue.interestPercentage(), '2.5');
  cy.clickContinueButton();

  /**
   * completes facility guarantee section
   * gets the facility ID from the URL
   * returns the facility ID
   */
  return cy
    .getFacilityIdFromUrl()
    .then((facilityId) => {
      facilityGuarantee.feeTypeInAdvanceInput().click();
      facilityGuarantee.feeFrequencyAnnuallyInput().first().click();
      facilityGuarantee.dayCountBasis360Input().click();
      facilityGuarantee.doneButton().click();

      return cy.wrap(facilityId);
    })
    .then((facilityId) => facilityId);
};

import submittedForChecking from '../../../../gef/cypress/e2e/pages/amendments/submitted-for-checking';

/**
 * Submit a portal amendment for review
 * @param {Boolean} param.coverEndDateExists - if cover end date is changed
 * @param {Boolean} param.facilityValueExists - if facility value is changed
 * @param {Boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {String} param.changedFacilityValue - the new value for the facility
 */
export const makerSubmitPortalAmendmentForReview = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
}) => {
  cy.makerMakesPortalAmendmentRequest({
    coverEndDateExists,
    facilityValueExists,
    facilityEndDateExists,
    changedFacilityValue,
  });

  cy.clickSubmitButton();

  submittedForChecking.returnLink().click();
};

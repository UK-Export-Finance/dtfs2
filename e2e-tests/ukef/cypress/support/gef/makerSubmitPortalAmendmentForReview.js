import { now } from '@ukef/dtfs2-common';
import amendmentPage from '../../../../gef/cypress/e2e/pages/amendments/amendment-shared';

/**
 * Submit a portal amendment for review
 * @param {Boolean} param.coverEndDateExists - if cover end date is changed
 * @param {Boolean} param.facilityValueExists - if facility value is changed
 * @param {Boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {String} param.changedFacilityValue - the new value for the facility
 * @param {String} param.changedCoverEndDate - the new cover end date
 */
export const makerSubmitPortalAmendmentForReview = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
  changedCoverEndDate,
  effectiveDate = now(),
}) => {
  cy.makerMakesPortalAmendmentRequest({
    coverEndDateExists,
    facilityValueExists,
    facilityEndDateExists,
    changedFacilityValue,
    changedCoverEndDate,
    effectiveDate,
  });

  cy.clickSubmitButton();

  amendmentPage.returnLink().click();
};

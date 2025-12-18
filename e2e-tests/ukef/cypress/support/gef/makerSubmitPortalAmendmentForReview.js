import { today } from '@ukef/dtfs2-common/test-helpers';
import amendmentPage from '../../../../gef/cypress/e2e/pages/amendments/amendment-shared';

/**
 * Submit a portal amendment for review
 * @param {boolean} param.coverEndDateExists - if cover end date is changed
 * @param {boolean} param.facilityValueExists - if facility value is changed
 * @param {boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {string} param.changedFacilityValue - the new value for the facility
 * @param {string} param.changedCoverEndDate - the new cover end date
 * @param {string} param.changedBankReviewDate - the new bank review date
 * @param {string} param.effectiveDate - the effective date of the amendment
 */
export const makerSubmitPortalAmendmentForReview = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
  changedCoverEndDate,
  changedBankReviewDate,
  effectiveDate = today.date,
}) => {
  cy.makerMakesPortalAmendmentRequest({
    coverEndDateExists,
    facilityValueExists,
    facilityEndDateExists,
    changedFacilityValue,
    changedCoverEndDate,
    changedBankReviewDate,
    effectiveDate,
  });

  cy.clickSubmitButton();

  amendmentPage.returnLink().click();
};

import { today } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../e2e/relativeURL';

/**
 * Submit a portal amendment to UKEF
 * @param {boolean} param.coverEndDateExists - if cover end date is changed
 * @param {boolean} param.facilityValueExists - if facility value is changed
 * @param {boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {string} param.changedFacilityValue - the new value for the facility
 * @param {string} param.changedCoverEndDate - the new cover end date
 * @param {string} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {string} param.submitToUkefUrl - the URL to the confirm amendment submission page
 * @param {string} param.submittedUrl - the URL to the approved by ukef page
 */
export const makerAndCheckerSubmitPortalAmendmentRequest = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  effectiveDate = today.date,
  changedFacilityValue,
  changedCoverEndDate,
  changedBankReviewDate,
  amendmentDetailsUrl,
  confirmSubmissionToUkefUrl,
  submittedUrl,
}) => {
  // submits maker part of journey
  cy.makerSubmitPortalAmendmentForReview({
    coverEndDateExists,
    facilityValueExists,
    facilityEndDateExists,
    changedFacilityValue,
    changedCoverEndDate,
    changedBankReviewDate,
    effectiveDate,
  });

  // submits checker part of journey
  cy.checkerSubmitsPortalAmendmentRequest({ amendmentDetailsUrl, submittedUrl, confirmSubmissionToUkefUrl });

  cy.url().should('eq', relative(submittedUrl));
};

import relative from '../../e2e/relativeURL';

/**
 * Returns a portal amendment to the maker for further inputs
 * @param {boolean} param.coverEndDateExists - if cover end date is changed
 * @param {boolean} param.facilityValueExists - if facility value is changed
 * @param {boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {string} param.changedFacilityValue - the new value for the facility
 * @param {string} param.changedCoverEndDate - the new cover end date
 * @param {string} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {string} param.confirmReturnToMakerUrl - the URL to the confirm return amendment to maker page
 * @param {string} param.submittedUrl - the URL to the approved returned the amendment to maker page
 */
export const makerSubmitAmendmentForReviewAndCheckerReturnsToMaker = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
  changedCoverEndDate,
  amendmentDetailsUrl,
  confirmReturnToMakerUrl,
  submittedUrl,
}) => {
  // submits maker part of journey
  cy.makerSubmitPortalAmendmentForReview({
    coverEndDateExists,
    facilityValueExists,
    facilityEndDateExists,
    changedFacilityValue,
    changedCoverEndDate,
  });

  // submits checker part of journey
  cy.checkerReturnsAmendmentToMaker({ amendmentDetailsUrl, confirmReturnToMakerUrl, submittedUrl });

  cy.url().should('eq', relative(submittedUrl));
};

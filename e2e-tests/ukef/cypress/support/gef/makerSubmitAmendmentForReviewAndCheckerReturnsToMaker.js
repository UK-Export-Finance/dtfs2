import relative from '../../e2e/relativeURL';

/**
 * Returns a portal amendment to the maker for further inputs
 * @param {Boolean} param.coverEndDateExists - if cover end date is changed
 * @param {Boolean} param.facilityValueExists - if facility value is changed
 * @param {Boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {String} param.changedFacilityValue - the new value for the facility
 * @param {String} param.changedCoverEndDate - the new cover end date
 * @param {String} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {String} param.confirmReturnToMakerUrl - the URL to the confirm return amendment to maker page
 * @param {String} param.submittedUrl - the URL to the approved returned the amendment to maker page
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

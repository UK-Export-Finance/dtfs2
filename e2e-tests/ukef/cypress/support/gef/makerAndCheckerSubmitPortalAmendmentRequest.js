import relative from '../../e2e/relativeURL';

/**
 * Submit a portal amendment to UKEF
 * @param {Boolean} param.coverEndDateExists - if cover end date is changed
 * @param {Boolean} param.facilityValueExists - if facility value is changed
 * @param {Boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {String} param.changedFacilityValue - the new value for the facility
 * @param {String} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {String} param.submitToUkefUrl - the URL to the confirm amendment submission page
 * @param {String} param.submittedUrl - the URL to the approved by ukef page
 */
export const makerAndCheckerSubmitPortalAmendmentRequest = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
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
  });

  // submits checker part of journey
  cy.checkerSubmitsPortalAmendmentRequest({ amendmentDetailsUrl, submittedUrl, confirmSubmissionToUkefUrl });

  cy.url().should('eq', relative(submittedUrl));
};

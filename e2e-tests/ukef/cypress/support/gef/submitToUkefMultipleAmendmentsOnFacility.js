import { applicationPreview } from '../../../../gef/cypress/e2e/pages';
/**
 * Submit multiple portal amendments
 * @param {string} param.dealId - the deal id
 * @param {string} param.facilityId - the facility id
 * @param {Number} param.numberOfAmendments - number of amendments to add
 */
export const submitToUkefMultipleAmendmentsOnFacility = ({ dealId, facilityId, numberOfAmendments }) => {
  for (let i = 0; i < numberOfAmendments; i += 1) {
    applicationPreview.makeAChangeButton(facilityId).click();
    cy.getAmendmentIdFromUrl().then((amendmentId) => {
      const submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
      const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;
      const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

      const CHANGED_FACILITY_VALUE = '20000';

      cy.makerAndCheckerSubmitPortalAmendmentRequest({
        facilityValueExists: true,
        changedFacilityValue: CHANGED_FACILITY_VALUE,
        amendmentDetailsUrl,
        submittedUrl,
        confirmSubmissionToUkefUrl,
      });
    });
  }
};

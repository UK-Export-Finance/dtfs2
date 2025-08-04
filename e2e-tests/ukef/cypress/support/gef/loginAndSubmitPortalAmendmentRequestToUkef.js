import relative from '../../e2e/relativeURL';
import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';

import { applicationPreview } from '../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Log in and submit a portal amendment to UKEF
 * @param {boolean} param.coverEndDateExists - if cover end date is changed
 * @param {boolean} param.facilityValueExists - if facility value is changed
 * @param {boolean} param.facilityEndDateExists - if facility end date is changed
 * @param {string} param.changedFacilityValue - the new value for the facility
 * @param {string} param.changedCoverEndDate - the new cover end date
 * @param {string} param.applicationDetailsUrl - the URL to the application details page
 * @param {string} param.facilityId - the ID of the facility
 * @param {string} param.dealId - the ID of the deal
 */
export const loginAndSubmitPortalAmendmentRequestToUkef = ({
  coverEndDateExists = false,
  facilityValueExists = false,
  facilityEndDateExists = false,
  changedFacilityValue,
  changedCoverEndDate,
  applicationDetailsUrl,
  facilityId,
  dealId,
}) => {
  cy.login(BANK1_MAKER1);
  cy.saveSession();

  cy.visit(relative(applicationDetailsUrl));
  applicationPreview.makeAChangeButton(facilityId).click();

  cy.getAmendmentIdFromUrl().then((amendmentId) => {
    const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;
    const submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
    const approvedByUkefUrl = `${submittedUrl}/approved-by-ukef`;
    const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

    cy.makerAndCheckerSubmitPortalAmendmentRequest({
      facilityValueExists,
      coverEndDateExists,
      facilityEndDateExists,
      changedFacilityValue,
      changedCoverEndDate,
      amendmentDetailsUrl,
      submittedUrl: approvedByUkefUrl,
      confirmSubmissionToUkefUrl,
    });
  });
};

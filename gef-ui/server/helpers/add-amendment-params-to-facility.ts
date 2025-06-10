import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { FacilityWithAmendmentFields, AddAmendmentToFacilityParams } from '../types/portal-amendments';
import { PORTAL_AMENDMENT_PAGES } from '../constants/amendments';
import { MAKER } from '../constants/roles';

const { AMENDMENT_DETAILS } = PORTAL_AMENDMENT_PAGES;

/**
 * Adds amendment related parameters to a facility object
 * generates the amendment details URL
 * Text and URL for amendment details for amendments with different statuses
 * returns a new facility object with the additional parameters
 * @param param.facility - the facility to which amendment parameters will be added
 * @param param.dealId - the ID of the deal to which the facility belongs
 * @param param.userRoles - the roles of the user accessing the facility
 * @param param.isFacilityWithAmendmentInProgress - amendment which is in progress for the facility
 * @param param.readyForCheckerAmendmentDetailsUrlAndText - array to hold text and URL for amendments ready for checkers approval
 * @param param.furtherMakersInputAmendmentDetailsUrlAndText - array to hold text and URL for amendments requiring further maker's input
 * @returns facility with amendment parameters and status text and urls
 */
export const addAmendmentParamsToFacility = ({
  facility,
  dealId,
  userRoles,
  isFacilityWithAmendmentInProgress,
  readyForCheckerAmendmentDetailsUrlAndText,
  furtherMakersInputAmendmentDetailsUrlAndText,
}: AddAmendmentToFacilityParams): FacilityWithAmendmentFields => {
  /**
   * if amendment is in progress
   * generate the amendment details URL
   * generates the text and URL for the status box
   * adds the text and url to relevant array based on the status of the amendment
   * eg. if the status is READY_FOR_CHECKERS_APPROVAL, add to readyForCheckerAmendmentDetailsUrlAndText
   */
  const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facility.facilityId}/amendments/${isFacilityWithAmendmentInProgress.amendmentId}/${AMENDMENT_DETAILS}`;

  const toAdd = {
    text: `Facility (${facility.ukefFacilityId}) amendment details`,
    amendmentDetailsUrl,
  };

  const isReadyForCheckersApproval = isFacilityWithAmendmentInProgress.status === PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;
  const isFurtherMakersInputRequired = isFacilityWithAmendmentInProgress.status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED;

  if (isReadyForCheckersApproval) {
    readyForCheckerAmendmentDetailsUrlAndText.push(toAdd);
  }

  if (isFurtherMakersInputRequired && userRoles.includes(MAKER)) {
    furtherMakersInputAmendmentDetailsUrlAndText.push(toAdd);
  }

  const facilityToReturn = {
    ...facility,
    isFacilityWithAmendmentInProgress,
    amendmentDetailsUrl,
  };

  const hasReadyForCheckerAmendments = readyForCheckerAmendmentDetailsUrlAndText.length > 0;
  const hasFurtherMakersInputAmendments = furtherMakersInputAmendmentDetailsUrlAndText.length > 0;

  return {
    mappedFacility: facilityToReturn,
    readyForCheckerAmendmentDetailsUrlAndText,
    furtherMakersInputAmendmentDetailsUrlAndText,
    hasReadyForCheckerAmendments,
    hasFurtherMakersInputAmendments,
  };
};

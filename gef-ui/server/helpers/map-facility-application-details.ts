import { Role, PORTAL_AMENDMENT_INPROGRESS_STATUSES, DEAL_STATUS } from '@ukef/dtfs2-common';
import { STAGE } from '../constants';
import { addAmendmentParamsToFacility } from './add-amendment-params-to-facility';
import { canUserAmendIssuedFacilities } from '../utils/facility-amendments.helper';
import { Deal } from '../types/deal';
import { Facility, FacilityParams } from '../types/facility';
import { AmendmentDetailsUrlAndText, AmendmentInProgressParams } from '../types/portal-amendments';

export type AmendmentDetailsFacilityParams = {
  readyForCheckerAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  furtherMakersInputAmendmentDetailsUrlAndText: AmendmentDetailsUrlAndText[];
  hasReadyForCheckerAmendments: boolean;
  hasFurtherMakersInputAmendments: boolean;
};

export type FacilityAndParams = {
  mappedFacilities: Facility[];
  facilityParams: AmendmentDetailsFacilityParams;
};

/**
 * Maps through facilities for the application details page
 * flags facilities that are issued and have an amendment in progress
 * checks if facility is issued, checks if facility does not have an amendment in progress and checks if user can amend issued facilities
 * if all 3 are true, set canIssuedFacilitiesBeAmended to true
 * Adds these flags/params to facilities while mapping
 * returns mapped facilities and additional relevant parameters for amendments
 * @param application - provided application
 * @param facilities - facilities for provided application
 * @param amendmentsInProgress - array of ids and statuses for amendments in progress
 * @param facilityRelevantParams relevant current params for facilities
 * @param userRoles - users role
 * @returns object with mapped facilities and set params for facilities
 */
export const mapFacilityApplicationDetails = (
  application: Deal,
  facilities: FacilityParams[],
  amendmentsInProgress: AmendmentInProgressParams[],
  facilityRelevantParams: AmendmentDetailsFacilityParams,
  userRoles: Role[],
): FacilityAndParams => {
  const facilityParams = facilityRelevantParams;

  const mappedFacilities = facilities.map((eachFacility: FacilityParams) => {
    const facilityToMap = eachFacility;

    const dealIsCancelled = application.status === DEAL_STATUS.CANCELLED;

    if (dealIsCancelled) {
      return facilityToMap;
    }

    const isFacilityIssued = eachFacility.stage === STAGE.ISSUED;

    const userCanAmendIssuedFacilities = canUserAmendIssuedFacilities(application.submissionType, application.status, userRoles);

    const isFacilityWithAmendmentInProgress = amendmentsInProgress.find(
      (item: AmendmentInProgressParams) => item.facilityId === eachFacility.facilityId && PORTAL_AMENDMENT_INPROGRESS_STATUSES.includes(item.status),
    );

    const canIssuedFacilitiesBeAmended = isFacilityIssued && userCanAmendIssuedFacilities && !isFacilityWithAmendmentInProgress;

    facilityToMap.canIssuedFacilitiesBeAmended = canIssuedFacilitiesBeAmended;

    if (isFacilityWithAmendmentInProgress) {
      const {
        mappedFacility,
        readyForCheckerAmendmentDetailsUrlAndText,
        furtherMakersInputAmendmentDetailsUrlAndText,
        hasReadyForCheckerAmendments,
        hasFurtherMakersInputAmendments,
      } = addAmendmentParamsToFacility({
        facility: facilityToMap,
        dealId: application._id,
        userRoles,
        isFacilityWithAmendmentInProgress,
        readyForCheckerAmendmentDetailsUrlAndText: facilityParams.readyForCheckerAmendmentDetailsUrlAndText,
        furtherMakersInputAmendmentDetailsUrlAndText: facilityParams.furtherMakersInputAmendmentDetailsUrlAndText,
      });

      if (readyForCheckerAmendmentDetailsUrlAndText.length) {
        facilityParams.readyForCheckerAmendmentDetailsUrlAndText = readyForCheckerAmendmentDetailsUrlAndText;
      }

      if (furtherMakersInputAmendmentDetailsUrlAndText.length) {
        facilityParams.furtherMakersInputAmendmentDetailsUrlAndText = furtherMakersInputAmendmentDetailsUrlAndText;
      }

      if (hasReadyForCheckerAmendments) {
        facilityParams.hasReadyForCheckerAmendments = true;
      }

      if (hasFurtherMakersInputAmendments) {
        facilityParams.hasFurtherMakersInputAmendments = true;
      }

      return mappedFacility;
    }

    return facilityToMap;
  });

  return {
    mappedFacilities,
    facilityParams,
  };
};

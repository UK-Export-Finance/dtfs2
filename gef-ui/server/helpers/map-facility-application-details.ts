import { Role, PORTAL_AMENDMENT_INPROGRESS_STATUSES, DEAL_STATUS, PORTAL_AMENDMENT_STATUS, now } from '@ukef/dtfs2-common';
import { STAGE } from '../constants';
import { addAmendmentParamsToFacility } from './add-amendment-params-to-facility';
import { canUserAmendIssuedFacilities } from '../utils/facility-amendments.helper';
import { Facility, FacilityParams } from '../types/facility';
import { AmendmentDetailsUrlAndText, SubmittedAmendmentsParams } from '../types/portal-amendments';
import { Deal } from '../types/deal';

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
 * @param submittedAmendments - array of ids and statuses for amendments in progress
 * @param facilityRelevantParams relevant current params for facilities
 * @param userRoles - users role
 * @returns object with mapped facilities and set params for facilities
 */
export const mapFacilityApplicationDetails = (
  application: Deal,
  facilities: FacilityParams[],
  submittedAmendments: SubmittedAmendmentsParams[],
  facilityRelevantParams: AmendmentDetailsFacilityParams,
  userRoles: Role[],
): FacilityAndParams => {
  const facilityParams = facilityRelevantParams;
  const { submissionType, status } = application;

  const mappedFacilities = facilities.map((facility: FacilityParams) => {
    const facilityToMap = facility;

    const cancelledDealStatuses: string[] = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];
    const dealIsCancelled = cancelledDealStatuses.includes(application.status);

    /**
     * If the deal is cancelled,
     * we do not want to map any further details for facilities.
     */
    if (dealIsCancelled) {
      return facilityToMap;
    }

    const isFacilityIssued = facility.stage === STAGE.ISSUED;

    const userCanAmendIssuedFacilities = canUserAmendIssuedFacilities(submissionType, status, userRoles);

    const isFacilityWithAmendmentInProgress = submittedAmendments.find(
      (item: SubmittedAmendmentsParams) => item.facilityId === facility.facilityId && PORTAL_AMENDMENT_INPROGRESS_STATUSES.includes(item.status),
    );

    const isFacilityWithEffectiveAmendment = submittedAmendments.find((item: SubmittedAmendmentsParams) => {
      const amendmentAcknowledged = item.status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;
      const amendmentEffectiveDateInFuture = new Date(item.effectiveDate) > now();
      return item.facilityId === facility.facilityId && amendmentAcknowledged && amendmentEffectiveDateInFuture;
    });

    /**
     * if the facility has been issued (after first submission) and the issuance is not yet submitted to UKEF
     * canResubmitIssuedFacilities will be true
     * else will be false or null
     */
    const canResubmitIssueFacilities = facilityToMap?.canResubmitIssuedFacilities;

    const canIssuedFacilitiesBeAmended =
      isFacilityIssued &&
      userCanAmendIssuedFacilities &&
      !isFacilityWithAmendmentInProgress &&
      !isFacilityWithEffectiveAmendment &&
      !canResubmitIssueFacilities;

    facilityToMap.canIssuedFacilitiesBeAmended = canIssuedFacilitiesBeAmended;

    if (isFacilityWithAmendmentInProgress || isFacilityWithEffectiveAmendment) {
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
        isFacilityWithEffectiveAmendment,
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

import { Facility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';

/**
 * Creates a tfm facility that can be used for utilisation reporting testing.
 * It can be replaced by creating a deal with a facility manually and then pulling from the mongo db collection.
 * This way we ensure we are inserting a valid facility.
 * @param facilityId - id of the facility
 * @param facilitySnapshot - a facility
 * @param portalUserId - id of a portal user
 * @returns a tfm facility
 */
export const aTfmFacility = (facilityId: ObjectId, facilitySnapshot: Facility, portalUserId: ObjectId) => ({
  _id: facilityId,
  facilitySnapshot,
  tfm: {
    hasBeenIssuedAndAcknowledged: true,
    feeRecord: 5622.222222222223,
    ukefExposure: 400000,
    ukefExposureCalculationTimestamp: '1726061293119',
    exposurePeriodInMonths: 42,
    facilityGuaranteeDates: {
      guaranteeCommencementDate: '2024-09-11',
      guaranteeExpiryDate: '2028-02-29',
      effectiveDate: '2024-09-11',
    },
    riskProfile: 'Flat',
  },
  auditRecord: {
    lastUpdatedAt: '2024-09-11T13:28:19.793 +00:00',
    lastUpdatedByPortalUserId: portalUserId,
    lastUpdatedByTfmUserId: null,
    lastUpdatedByIsSystem: null,
    noUserLoggedIn: null,
  },
});

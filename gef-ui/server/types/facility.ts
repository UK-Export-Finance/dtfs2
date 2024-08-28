import { GefFacilityType, IsoDateTimeStamp } from '@ukef/dtfs2-common';

/**
 * Facility object received from portal-api
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Facility = {
  _id: string;
  dealId: string;
  type: GefFacilityType;
  hasBeenIssued?: boolean | null;
  shouldCoverStartOnSubmission?: boolean | null;
  coverStartDate?: IsoDateTimeStamp | null;
  coverEndDate?: IsoDateTimeStamp | null;
  issueDate?: IsoDateTimeStamp | null;
  monthsOfCover?: number | null;
  details?: Record<string, unknown> | null;
  detailsOther?: string | null;
  currency?: Record<string, unknown> | null;
  value?: number | null;
  coverPercentage?: number | null;
  interestPercentage?: number | null;
  createdAt?: IsoDateTimeStamp;
  updatedAt?: IsoDateTimeStamp;
  ukefFacilityId?: string;
  dayCountBasis?: number | null;
  specialIssuePermission: Record<string, unknown> | null;
  canResubmitIssuedFacilities?: boolean | null;
  unissuedToIssuedByMaker?: Record<string, unknown> | null;
  // The following are only found on facilities from version 1 or higher deals
  isUsingFacilityEndDate?: boolean | null;
  facilityEndDate?: IsoDateTimeStamp | null;
  bankReviewDate?: IsoDateTimeStamp | null;
};

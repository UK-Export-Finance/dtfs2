import { GefFacilityType, IsoDateTimeStamp, AnyObject, Currency } from '@ukef/dtfs2-common';

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
  details?: AnyObject | null;
  detailsOther?: string | null;
  currency?: {
    id: Currency;
  } | null;
  value?: number | null;
  coverPercentage?: number | null;
  interestPercentage?: number | null;
  createdAt?: IsoDateTimeStamp;
  updatedAt?: IsoDateTimeStamp;
  ukefFacilityId?: string;
  dayCountBasis?: number | null;
  specialIssuePermission: AnyObject | null;
  canResubmitIssuedFacilities?: boolean | null;
  unissuedToIssuedByMaker?: AnyObject | null;
  // The following are only found on facilities from version 1 or higher deals
  isUsingFacilityEndDate?: boolean | null;
  facilityEndDate?: IsoDateTimeStamp | null;
  bankReviewDate?: IsoDateTimeStamp | null;
};

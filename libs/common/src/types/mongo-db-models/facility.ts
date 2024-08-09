import { ObjectId } from 'mongodb';
import { UnixTimestamp, UnixTimestampString } from '../date';
import { Currency } from '../currency';
import { FacilityType } from '../facility-type';

/**
 * These properties will not exist if on a BSS/EWCS deal or the deal version is less than 1
 */
type FacilityEndDateProperties =
  | {
      isUsingFacilityEndDate: true;
      bankReviewDate: Date | null;
      facilityEndDate?: null;
    }
  | {
      isUsingFacilityEndDate: false;
      bankReviewDate?: null;
      facilityEndDate?: Date | null;
    }
  | {
      isUsingFacilityEndDate?: null;
      bankReviewDate?: null;
      facilityEndDate?: null;
    };

/**
 * Type of the mongo db "facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Facility = {
  _id: ObjectId;
  dealId: ObjectId;
  type: FacilityType;
  hasBeenIssued: boolean;
  name: string;
  shouldCoverStartOnSubmission: boolean;
  coverStartDate: UnixTimestampString | Date | null;
  coverEndDate: UnixTimestampString | Date | null;
  issueDate: UnixTimestampString | Date | null;
  monthsOfCover: number | null;
  details: string[];
  detailsOther: string;
  currency: {
    id: Currency;
  };
  value: number;
  coverPercentage: number;
  interestPercentage: number;
  paymentType: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  ukefExposure: number;
  guaranteeFee: number;
  submittedAsIssuedDate: UnixTimestampString | null;
  ukefFacilityId: string | null;
  feeType: string;
  feeFrequency: string;
  dayCountBasis: number;
  coverDateConfirmed: boolean | null;
  hasBeenIssuedAndAcknowledged: boolean | null;
  canResubmitIssuedFacilities: boolean | null;
  unissuedToIssuedByMaker: object;
} & FacilityEndDateProperties;

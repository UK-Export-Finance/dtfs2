import { ObjectId } from 'mongodb';
import { UnixTimestamp, UnixTimestampString } from '../date';
import { Currency } from '../currency';

/**
 * Type of the mongo db "facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type Facility = {
  _id: ObjectId;
  dealId: ObjectId;
  type: string;
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
};

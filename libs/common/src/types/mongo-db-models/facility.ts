import { ObjectId } from 'mongodb';
import { UnixTimestamp } from '../date';
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
  coverStartDate: UnixTimestamp | null;
  coverEndDate: UnixTimestamp | null;
  issueDate: UnixTimestamp | null;
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
  submittedAsIssuedDate: null;
  ukefFacilityId: null;
  feeType: string;
  feeFrequency: string;
  dayCountBasis: number;
  coverDateConfirmed: boolean | null;
  hasBeenIssuedAndAcknowledged: boolean | null;
  canResubmitIssuedFacilities: boolean | null;
  unissuedToIssuedByMaker: object;
};

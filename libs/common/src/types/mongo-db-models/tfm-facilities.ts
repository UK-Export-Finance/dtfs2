import { ObjectId } from 'mongodb';
import { UnixTimestamp } from '../date';
import { AmendmentStatus } from '../amendment-status';
import { Currency } from '../currency';
import { Facility } from './facility';

type SubmittedByUser = {
  _id: ObjectId;
  username: string;
  name: string;
  email: string;
};

/**
 * Type of the mongo db "tfm-facilities" collection
 * "amendments" property
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmFacilityAmendment = {
  amendmentId: ObjectId;
  facilityId: ObjectId;
  dealId: ObjectId;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  status: AmendmentStatus;
  version: number;
  changeCoverEndDate?: boolean;
  coverEndDate?: UnixTimestamp;
  currentCoverEndDate?: UnixTimestamp;
  changeFacilityValue?: boolean;
  value?: number;
  currentValue?: number;
  currency?: Currency;
  requestDate?: number;
  ukefExposure?: number;
  coveredPercentage?: number;
  requireUkefApproval?: boolean;
  submissionType?: string;
  submittedByPim?: boolean;
  submittedAt?: UnixTimestamp;
  sendFirstTaskEmail?: boolean;
  firstTaskEmailSent?: boolean;
  ukefDecision?: {
    coverEndDate?: string;
    value?: string;
    conditions?: string;
    declined?: null;
    comments?: string;
    submitted?: boolean;
    submittedAt?: UnixTimestamp;
    submittedBy?: SubmittedByUser;
    managersDecisionEmail?: boolean;
    managersDecisionEmailSent?: boolean;
  };
  bankDecision?: {
    decision?: string;
    receivedDate: UnixTimestamp;
    effectiveDate?: UnixTimestamp;
    submitted?: boolean;
    banksDecisionEmail?: boolean;
    banksDecisionEmailSent?: boolean;
    submittedAt?: UnixTimestamp;
    submittedBy?: SubmittedByUser;
  };
  createdBy?: {
    username: string;
    name: string;
    email: string;
  };
  tfm?: {
    value?: {
      value: number;
      currency: Currency;
    };
    amendmentExposurePeriodInMonths?: number;
    exposure?: {
      exposure: number | string;
      timestamp: UnixTimestamp | null;
      ukefExposureValue: number;
    };
    coverEndDate?: UnixTimestamp;
  };
  tasks?: {
    groupTitle: string;
    id: number;
    groupTasks: Record<string, unknown>[];
  }[];
  leadUnderwriter?: {
    _id: ObjectId | 'Unassigned';
    firstName: string;
    lastName: string;
  };
};

/**
 * Type of the mongo db "tfm-facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmFacility = {
  _id: ObjectId;
  facilitySnapshot: Facility;
  amendments?: TfmFacilityAmendment[];
};

import { ObjectId } from 'mongodb';
import { UnixTimestamp, UnixTimestampSeconds } from '../date';
import { PortalAmendmentStatus, TfmAmendmentStatus } from '../amendment-status';
import { Currency } from '../currency';
import { Facility } from './facility';
import { AnyObject } from '../any-object';
import { AuditDatabaseRecord } from '../audit-database-record';
import { AMENDMENT_TYPES } from '../../constants';
import { AmendmentsEligibilityCriterion } from './amendments-eligibility-criteria';

type SubmittedByUser = {
  _id: ObjectId;
  username: string;
  name: string;
  email: string;
};

/**
 * Type of the mongo db "tfm-facilities" collection "tfm" property within the "amendments" property.
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type FacilityAmendmentTfmObject = {
  value?: {
    value: number;
    currency: Currency;
  };
  amendmentExposurePeriodInMonths?: number | null;
  exposure?: {
    exposure: number | string;
    timestamp: UnixTimestamp | null;
    ukefExposureValue: number;
  };
  coverEndDate?: UnixTimestamp;
  facilityEndDate?: Date;
  bankReviewDate?: Date;
  isUsingFacilityEndDate?: boolean;
};

/*
 * Properties common to all amendments
 */
interface BaseAmendment {
  amendmentId: ObjectId;
  facilityId: ObjectId;
  dealId: ObjectId;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  changeCoverEndDate?: boolean;
  coverEndDate?: UnixTimestamp | null;
  isUsingFacilityEndDate?: boolean;
  facilityEndDate?: Date;
  bankReviewDate?: Date;
  changeFacilityValue?: boolean;
  value?: number | null;
  currency?: Currency | null;
  effectiveDate?: UnixTimestampSeconds;
  createdBy?: {
    username: string;
    name: string;
    email: string;
  };
}

/**
 * Amendments created in TFM
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export interface TfmFacilityAmendment extends BaseAmendment {
  type?: typeof AMENDMENT_TYPES.TFM;
  currentCoverEndDate?: UnixTimestamp | null;
  currentValue?: number | null;
  requestDate?: UnixTimestamp;
  ukefExposure?: number | null;
  coveredPercentage?: number;
  requireUkefApproval?: boolean;
  submissionType?: string;
  submittedAt?: UnixTimestamp;
  submissionDate?: UnixTimestamp;
  status: TfmAmendmentStatus;
  version: number;
  submittedByPim?: boolean;
  sendFirstTaskEmail?: boolean;
  firstTaskEmailSent?: boolean;
  automaticApprovalEmail?: boolean;
  ukefDecision?: {
    coverEndDate?: string;
    value?: string;
    conditions?: string | null;
    declined?: string | null;
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
    effectiveDate?: UnixTimestamp | null;
    submitted?: boolean;
    banksDecisionEmail?: boolean;
    banksDecisionEmailSent?: boolean;
    submittedAt?: UnixTimestamp;
    submittedBy?: SubmittedByUser;
  };
  tfm?: FacilityAmendmentTfmObject;
  tasks?: {
    groupTitle: string;
    id: number;
    groupTasks: AnyObject[];
  }[];
  leadUnderwriter?: {
    _id: ObjectId | 'Unassigned';
    firstName: string;
    lastName: string;
  };
}

export interface AmendmentsEligibilityCriterionWithAnswer extends AmendmentsEligibilityCriterion {
  answer: boolean | null;
}

/**
 * Amendments created in Portal
 */
export interface PortalFacilityAmendment extends BaseAmendment {
  type: typeof AMENDMENT_TYPES.PORTAL;
  status: PortalAmendmentStatus;
  eligibilityCriteria: {
    version: number;
    criteria: AmendmentsEligibilityCriterionWithAnswer[];
  };
}

/**
 * Type of the mongo db "tfm-facilities" collection
 * "amendments" property
 */
export type FacilityAmendment = TfmFacilityAmendment | PortalFacilityAmendment;

/**
 * Type of the mongo db "tfm-facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmFacility = {
  _id: ObjectId;
  facilitySnapshot: Facility;
  amendments?: FacilityAmendment[];
  tfm: object;
  auditRecord?: AuditDatabaseRecord;
};

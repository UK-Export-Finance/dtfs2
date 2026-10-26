import { ObjectId } from 'mongodb';
import { UnixTimestamp, UnixTimestampSeconds } from '@ukef/types/date';
import { PortalAmendmentStatus, TfmAmendmentStatus } from '@ukef/types/amendment-status';
import { Currency } from '@ukef/types/currency';
import { AnyObject } from '@ukef/types/any-object';
import { AuditDatabaseRecord } from '@ukef/types/audit-database-record';
import { AMENDMENT_TYPES } from '@ukef/constants';
import { Facility, FacilityWithStringDealId } from './facility';
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
    value?: number;
    currency?: Currency;
  };
  amendmentExposurePeriodInMonths?: number | null;
  exposure?: {
    exposure?: number | string;
    timestamp?: UnixTimestamp | null;
    ukefExposureValue?: number;
  };
  coverEndDate?: UnixTimestamp;
  facilityEndDate?: Date;
  bankReviewDate?: Date;
  isUsingFacilityEndDate?: boolean;
};

/*
 * Properties common to all amendments
 */
type BaseAmendment = {
  amendmentId: ObjectId;
  facilityId: ObjectId;
  dealId: ObjectId;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  changeCoverEndDate?: boolean;
  coverEndDate?: UnixTimestamp | null;
  isUsingFacilityEndDate?: boolean | null;
  facilityEndDate?: Date | null;
  bankReviewDate?: Date | null;
  changeFacilityValue?: boolean;
  value?: number | null;
  currency?: Currency | null;
  effectiveDate?: UnixTimestampSeconds;
  facilityType?: string;
  createdBy?: {
    username: string;
    name: string;
    email: string;
  };
  referenceNumber?: string | null;
  requestDate?: number | null;
};

/**
 * Amendments created in TFM
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmFacilityAmendment = {
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
} & BaseAmendment;

export type AmendmentsEligibilityCriterionWithAnswer = {
  answer: boolean | null;
} & AmendmentsEligibilityCriterion;

/**
 * Amendments created in Portal
 */
export type PortalFacilityAmendment = {
  type: typeof AMENDMENT_TYPES.PORTAL;
  status: PortalAmendmentStatus;
  eligibilityCriteria: {
    version: number;
    criteria: AmendmentsEligibilityCriterionWithAnswer[];
  };
  tfm?: FacilityAmendmentTfmObject;
  bankName?: string;
} & BaseAmendment;

/**
 * Type of the mongo db "tfm-facilities" collection
 * "amendments" property
 */
export type FacilityAmendment = TfmFacilityAmendment | PortalFacilityAmendment;

export type TfmFacilityGuaranteeDates = {
  guaranteeCommencementDate?: string;
  guaranteeExpiryDate?: string;
  effectiveDate?: string;
};

export type TfmFacilityObject = {
  exchangeRate?: number;
  facilityValueInGBP?: number;
  ukefExposure?: number;
  ukefExposureCalculationTimestamp?: string;
  hasBeenIssuedAndAcknowledged?: boolean;
  feeRecord?: number;
  exposurePeriodInMonths?: number;
  facilityGuaranteeDates?: TfmFacilityGuaranteeDates;
  riskProfile?: string;
};

export type TfmFacilitySnapshot = Facility & {
  guaranteeFeePayableToUkef?: string;
};

/**
 * Type of the mongo db "tfm-facilities" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmFacility = {
  _id: ObjectId;
  facilitySnapshot: TfmFacilitySnapshot;
  amendments?: FacilityAmendment[];
  tfm: TfmFacilityObject;
  auditRecord?: AuditDatabaseRecord;
};

export type TfmFacilityWithStringId = Omit<TfmFacility, '_id' | 'facilitySnapshot'> & {
  _id: ObjectId | string;
  facilitySnapshot: FacilityWithStringDealId;
};

export type GetTfmAmendmentInProgressResponse = {
  hasInProgressAllAmendments: PortalFacilityAmendment[] | TfmFacilityAmendment[] | false;
  hasInProgressPortalAmendments: PortalFacilityAmendment[] | false;
  hasAmendmentInProgressButton: boolean;
  showContinueAmendmentButton: boolean;
};

export type AmendmentEligibilityRows = {
  text?: string;
  html?: string;
};

type AmendmentMappingFields = {
  isPortalAmendment: boolean;
  eligibilityRows: AmendmentEligibilityRows[];
};

export type AmendmentWithEligibilityRows = (TfmFacilityAmendment & AmendmentMappingFields) | (PortalFacilityAmendment & AmendmentMappingFields);

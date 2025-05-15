import {
  AMENDMENT_TYPES,
  AmendmentsEligibilityCriterionWithAnswer,
  UnixTimestampSeconds,
  PortalAmendmentStatus,
  TfmAmendmentStatus,
  Currency,
  UnixTimestamp,
} from '@ukef/dtfs2-common';

export const PORTAL_AMENDMENT_PAGES = {
  WHAT_DO_YOU_NEED_TO_CHANGE: 'what-do-you-need-to-change',
  COVER_END_DATE: 'cover-end-date',
  DO_YOU_HAVE_A_FACILITY_END_DATE: 'do-you-have-a-facility-end-date',
  FACILITY_END_DATE: 'facility-end-date',
  BANK_REVIEW_DATE: 'bank-review-date',
  FACILITY_VALUE: 'facility-value',
  ELIGIBILITY: 'eligibility',
  EFFECTIVE_DATE: 'effective-date',
  CHECK_YOUR_ANSWERS: 'check-your-answers',
  MANUAL_APPROVAL_NEEDED: 'manual-approval-needed',
  CANCEL: 'cancel',
  SUBMITTED_FOR_CHECKING: 'submitted-for-checking',
  APPROVED_BY_UKEF: 'approved-by-ukef',
  AMENDMENT_DETAILS: 'amendment-details',
  SUBMIT_AMENDMENT_TO_UKEF: 'submit-amendment-to-ukef',
  ALL_TYPE_AMENDMENTS: 'all-type-amendments',
} as const;

export interface FacilityAmendmentWithUkefId {
  amendmentId: string;
  facilityId: string;
  dealId: string;
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
  type: typeof AMENDMENT_TYPES.PORTAL | typeof AMENDMENT_TYPES.TFM;
  status: PortalAmendmentStatus | TfmAmendmentStatus;
  ukefFacilityId: string | null;
  eligibilityCriteria: {
    version: number;
    criteria: AmendmentsEligibilityCriterionWithAnswer[];
  };
}

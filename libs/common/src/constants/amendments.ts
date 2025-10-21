import { DEAL_STATUS } from './portal';
import type { PortalAmendmentStatus } from '../types/amendment-status';

export const TFM_AMENDMENT_STATUS = {
  /**
   * Amendment is created but no values have been provided
   */
  NOT_STARTED: 'Not started',
  /**
   * Amendment is in progress. This includes PIM creating the amendment and (if `requireUkefApproval` is true) the underwriting process
   */
  IN_PROGRESS: 'In progress',
  /**
   * Amendment has been completed. It may have been accepted or rejected
   */
  COMPLETED: 'Completed',
} as const;

export const PORTAL_AMENDMENT_STATUS = {
  /**
   * Amendment is in progress by the maker but not submitted to the checker
   * This is not displayed in the UI
   */
  DRAFT: 'Draft',
  /**
   * Amendment has been submitted by the maker and is awaiting the checker's approval
   */
  READY_FOR_CHECKERS_APPROVAL: "Ready for Checker's approval",
  /**
   * Checker has requested changes from the maker
   */
  FURTHER_MAKERS_INPUT_REQUIRED: "Further Maker's input required",
  /**
   * Amendment has been acknowledged by the checker
   */
  ACKNOWLEDGED: 'Acknowledged',
} as const;

export const PORTAL_AMENDMENT_INPROGRESS_STATUSES: PortalAmendmentStatus[] = [
  PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
];

export const PORTAL_AMENDMENT_STARTED_STATUSES: PortalAmendmentStatus[] = [PORTAL_AMENDMENT_STATUS.DRAFT, ...PORTAL_AMENDMENT_INPROGRESS_STATUSES];

export const PORTAL_AMENDMENT_SUBMITTED_STATUSES: PortalAmendmentStatus[] = [
  PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
  PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
] as const;

export const TFM_AMENDMENT_SUBMITTED_STATUSES = [TFM_AMENDMENT_STATUS.IN_PROGRESS, TFM_AMENDMENT_STATUS.COMPLETED] as const;

export const ALL_AMENDMENT_SUBMITTED_STATUSES = [...PORTAL_AMENDMENT_SUBMITTED_STATUSES, ...TFM_AMENDMENT_SUBMITTED_STATUSES] as const;

export const PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES = [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED];

export const AMENDMENT_QUERIES = {
  LATEST_VALUE: 'latest-value',
  LATEST_COVER_END_DATE: 'latest-cover-end-date',
  LATEST_FACILITY_END_DATE: 'latest-facility-end-date',
  LATEST: 'latest',
} as const;

export const AMENDMENT_QUERY_STATUSES = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  APPROVED: 'approved',
};

export const CHECKERS_AMENDMENTS_DEAL_ID = 'checkersAmendmentDealId';

export const AMENDMENT_TYPES = {
  PORTAL: 'PORTAL',
  TFM: 'TFM',
} as const;

/**
 * The statuses for which amendment pages can be accessed
 */
export const AMENDMENT_ACCEPTABLE_DEAL_STATUSES = [DEAL_STATUS.UKEF_ACKNOWLEDGED] as string[];

/**
 * Represents the possible decisions a bank can make regarding an amendment.
 *
 * @property PROCEED - Indicates that the bank has decided to proceed with the amendment.
 * @property WITHDRAW - Indicates that the bank has withdrawn the amendment.
 */
export const AMENDMENT_BANK_DECISION = {
  PROCEED: 'Proceed',
  WITHDRAW: 'Withdrawn',
  NOT_APPLICABLE: 'Not applicable',
  AWAITING_DECISION: 'Awaiting decision',
};

/**
 * Enum-like object representing the types of submission amendments.
 *
 * @property MANUAL_AMENDMENT - Indicates a submission that was amended manually.
 * @property AUTOMATIC_AMENDMENT - Indicates a submission that was amended automatically.
 */
export const AMENDMENT_SUBMISSION_TYPE = {
  MANUAL_AMENDMENT: 'Manual Amendment',
  AUTOMATIC_AMENDMENT: 'Automatic Amendment',
};

/**
 * Maps each amendment bank decision to its corresponding GOV.UK tag CSS class.
 *
 * @remarks
 * This object uses the `AMENDMENT_BANK_DECISION` enum as keys and assigns
 * a string representing the appropriate GOV.UK tag color class for each decision.
 *
 * @example
 * BANK_DECISIONS_TAGS[AMENDMENT_BANK_DECISION.PROCEED] // 'govuk-tag--green'
 *
 * @see AMENDMENT_BANK_DECISION
 */
export const BANK_DECISIONS_TAGS = {
  [AMENDMENT_BANK_DECISION.PROCEED]: 'govuk-tag--green',
  [AMENDMENT_BANK_DECISION.WITHDRAW]: 'govuk-tag--red',
  [AMENDMENT_BANK_DECISION.NOT_APPLICABLE]: 'govuk-tag--red',
  [AMENDMENT_BANK_DECISION.AWAITING_DECISION]: 'govuk-tag--yellow',
};

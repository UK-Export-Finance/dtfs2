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

export const PORTAL_AMENDMENT_INPROGRESS_STATUSES = [
  PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
];

export const PORTAL_AMENDMENT_SUBMITTED_STATUSES = [
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

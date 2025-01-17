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
} as const;

export const AMENDMENT_QUERIES = {
  LATEST_VALUE: 'latest-value',
  LATEST_COVER_END_DATE: 'latest-cover-end-date',
  LATEST_FACILITY_END_DATE: 'latest-facility-end-date',
  LATEST: 'latest',
} as const;

export const AMENDMENT_TYPES = {
  PORTAL: 'PORTAL',
  TFM: 'TFM',
} as const;

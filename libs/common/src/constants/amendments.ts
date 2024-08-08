export const AMENDMENT_STATUS = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
} as const;

export const AMENDMENT_QUERIES = {
  LATEST_VALUE: 'latest-value',
  LATEST_COVER_END_DATE: 'latest-cover-end-date',
  LATEST_FACILITY_END_DATE: 'latest-facility-end-date',
  LATEST_BANK_REVIEW_DATE: 'latest-bank-review-date',
  LATEST: 'latest',
} as const;

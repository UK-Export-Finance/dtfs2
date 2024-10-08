/**
 * Represents the endpoints for the eStore API
 * using constant object statement to assert the
 * immutability and exact types of values at runtime.
 * `sites` becomes a type which then can be used with
 * `Category` type for both compile time and run time
 * type checking.
 */
export const ENDPOINT = {
  SITE: 'sites',
  TERM: 'terms/facilities',
  BUYER: 'buyers',
  DEAL: 'deals',
  FACILITY: 'facilities',
  DOCUMENT: 'documents',
} as const;

export const ESTORE_SITE_STATUS = {
  CREATED: 'Created',
  PROVISIONING: 'Provisioning',
  NOT_FOUND: 'Not found',
};

export const ESTORE_CRON_STATUS = {
  PENDING: 'Pending',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

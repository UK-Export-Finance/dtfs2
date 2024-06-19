export const ENDPOINT = {
  SITE: 'sites',
  TERM: 'terms/facilities',
  BUYER: 'buyer',
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

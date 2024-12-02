/**
 * These are the field names used on the deal filter query object received by the portal endpoint
 * These are mapped into a query to send to portal-api
 */
const DEAL = {
  DEAL_TYPE: 'dealType',
  SUBMISSION_TYPE: 'submissionType',
  STATUS: 'status',
  CREATED_BY: 'createdBy',
  BANK_INTERNAL_REF_NAME: 'bankInternalRefName',
  EXPORTER_COMPANY_NAME: 'exporter.companyName',
  GEF_UKEF_DEAL_ID: 'ukefDealId',
  BSS_EWCS_UKEF_DEAL_ID: 'details.ukefDealId',
};

/**
 * These are the field names used on the facility filter query object received by the portal endpoint
 * These are mapped into a query to send to portal-api
 */
const FACILITY = {
  TYPE: 'type',
  NAME: 'name',
  UKEF_FACILITY_ID: 'ukefFacilityId',
  CURRENCY: 'currency',
  VALUE: 'value',
  DEAL_SUBMISSION_TYPE: 'deal.submissionType',
  EXPORTER_COMPANY_NAME: 'deal.exporter.companyName',
  CREATED_BY: 'createdBy',
  STAGE: 'stage',
};

module.exports = {
  DEAL,
  FACILITY,
};

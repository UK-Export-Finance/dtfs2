/**
 * These are the field names used on the deal filter query object
 * This is sent to portal-api to query the database
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
 * These are the field names used on the facility filter query object
 * This is sent to portal-api to query the database
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

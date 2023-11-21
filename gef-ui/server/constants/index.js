const ROLES = require('./roles');
const ALL_BANKS_ID = require('./all-banks-id');

const DEAL_SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const DEAL_STATUS = {
  // these statuses can be either on the top level
  // or in a child object, not specific to the entire deal.
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',

  // statuses specific to the entire deal
  READY_FOR_APPROVAL: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

const DEAL_TYPE = {
  GEF: 'GEF',
};

const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
};

const BOOLEAN = {
  YES: 'Yes',
  NO: 'No',
};

const STAGE = {
  ISSUED: 'Issued',
  UNISSUED: 'Unissued',
};

const FACILITY_PROVIDED_DETAILS = {
  TERM: 'Term basis',
  RESOLVING: 'Revolving or renewing basis',
  COMMITTED: 'Committed basis',
  UNCOMMITTED: 'Uncommitted basis',
  ON_DEMAND: 'On demand or overdraft basis',
  FACTORING: 'Factoring on a  with-recourse basis',
  OTHER: 'Other',
};

const FACILITY_PAYMENT_TYPE = {
  IN_ADVANCE: 'In advance',
  IN_ARREARS: 'In arrears',
  AT_MATURITY: 'At maturity',
};

const AUTHORISATION_LEVEL = {
  READ: 'READ',
  COMMENT: 'COMMENT',
  EDIT: 'EDIT',
  CHANGE_STATUS: 'CHANGE_STATUS',
};

const DEFAULT_COUNTRY = 'United Kingdom';

const DATE_FORMAT = {
  COVER: 'MMMM d, yyyy',
};

const COMPANIES_HOUSE_NUMBER_REGEX = /^(([A-Z]{2}|[A-Z]\d{1}|\d{2})(\d{5,6}|\d{4,5}[A-Z]))$/;

const UK_POSTCODE_REGEX = /^[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]?\s?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/;

module.exports = {
  ROLES,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  DEAL_TYPE,
  FACILITY_TYPE,
  BOOLEAN,
  STAGE,
  FACILITY_PROVIDED_DETAILS,
  FACILITY_PAYMENT_TYPE,
  AUTHORISATION_LEVEL,
  DEFAULT_COUNTRY,
  DATE_FORMAT,
  COMPANIES_HOUSE_NUMBER_REGEX,
  UK_POSTCODE_REGEX,
  ALL_BANKS_ID,
};

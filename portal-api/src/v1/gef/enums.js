const DEAL_TYPE = 'GEF';

const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
};

const DEAL_STATUS = {
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
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

const ERROR = {
  ENUM_ERROR: 'ENUM_ERROR',
  MANDATORY_FIELD: 'MANDATORY_FIELD',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  OVERSEAS_COMPANY: 'OVERSEAS_COMPANY',
  FIELD_INVALID_CHARACTERS: 'FIELD_INVALID_CHARACTERS',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
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

module.exports = {
  DEAL_TYPE,
  FACILITY_TYPE,
  DEAL_STATUS,
  ERROR,
  FACILITY_PROVIDED_DETAILS,
  FACILITY_PAYMENT_TYPE,
};

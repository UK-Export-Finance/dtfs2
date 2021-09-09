const PROGRESS = {
  DRAFT: 'DRAFT',
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  BANK_CHECK: 'BANK_CHECK',
  CHANGES_REQUIRED: 'CHANGES_REQUIRED',
  COMPLETED: 'COMPLETED',
  SUBMITTED_TO_UKEF: 'SUBMITTED_TO_UKEF',
  ABANDONED: 'ABANDONED',
};

const DEAL_SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
};

const FACILITY_TYPE = {
  CASH: 'CASH',
  CONTINGENT: 'CONTINGENT',
};

const SME_TYPE = {
  MICRO: 'Micro',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  NOT_SME: 'Not an SME',
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

const AUTHORISATION_LEVEL = {
  READ: 'READ',
  COMMENT: 'COMMENT',
  EDIT: 'EDIT',
  CHANGE_STATUS: 'CHANGE_STATUS',
};

const DEFAULT_COUNTRY = 'United Kingdom';

module.exports = {
  PROGRESS,
  DEAL_SUBMISSION_TYPE,
  FACILITY_TYPE,
  SME_TYPE,
  BOOLEAN,
  STAGE,
  FACILITY_PROVIDED_DETAILS,
  AUTHORISATION_LEVEL,
  DEFAULT_COUNTRY,
};

const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

const SME_TYPE = {
  MICRO: 'Micro',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  NON_SME: 'Non-SME',
  NOT_KNOWN: 'Not known',
};

const SUPPLIER_TYPE = {
  EXPORTER: 'Exporter',
  UK_SUPPLIER: 'UK Supplier',
};

const APPLICATION_GROUP = {
  BSS_AND_EWCS: 'BSS and EWCS',
  BSS: 'BSS',
  EWCS: 'EWCS',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const SUBMISSION_TYPE_LOWERCASE = {
  AIN: 'Automatic inclusion notice',
  MIA: 'Manual inclusion application',
  MIN: 'Manual inclusion notice',
};

const ACTION_NAME = {
  '001': 'NewDeal',
  '003': 'NewDeal',
  '010': 'ATPConfirm',
  '016': 'AmendDeal',
};

const STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  INPUT_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED: 'Submitted',
  SUBMISSION_ACKNOWLEDGED: 'Acknowledged by UKEF',
  APPROVED: 'Accepted by UKEF (without conditions)',
  APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  REFUSED: 'Rejected by UKEF',
  CONFIRMED_BY_BANK: 'Confirmed by bank',
  CONFIRMATION_ACKNOWLEDGED: 'Acknowledged by UKEF',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
};

const GEF_STATUS = {
  // these statuses can be either on the top level
  // or in a child object, not specific to the entire deal.
  DRAFT: 'Draft',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',

  // statuses specific to the entire deal
  BANK_CHECK: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

module.exports = {
  DEAL_TYPE,
  SME_TYPE,
  SUPPLIER_TYPE,
  APPLICATION_GROUP,
  SUBMISSION_TYPE,
  ACTION_NAME,
  STATUS,
  GEF_STATUS,
  SUBMISSION_TYPE_LOWERCASE,
};

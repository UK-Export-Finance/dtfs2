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

const ACTION_NAME = {
  '001': 'NewDeal',
  '003': 'NewDeal',
  '010': 'ATPConfirm',
  '016': 'AmendDeal',
};

const DEAL_STATUS = {
  DRAFT: 'Draft',
  ABANDONED: 'Abandoned',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged by UKEF',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  CONFIRMED_BY_BANK: 'Confirmed by bank',
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
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
  DEAL_STATUS,
};

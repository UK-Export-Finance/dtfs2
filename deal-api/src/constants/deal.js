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
};

const ACTION_NAME = {
  '001': 'NewDeal',
  '003': 'NewDeal',
  '010': 'ATPConfirm',
  '016': 'AmendDeal',
};
/*
const STATUS = {
  draft: 'Draft',
  readyForApproval: 'Ready for Checker\'s approval',
  inputRequired: 'Further Maker\'s input required',
  abandoned: 'Abandoned Deal',
  submitted: 'Submitted',
  submissionAcknowledged: 'Acknowledged by UKEF',
  approved: 'Accepted by UKEF (without conditions)',
  approvedWithConditions: 'Accepted by UKEF (with conditions)',
  refused: 'Rejected by UKEF',
};
*/
const STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  INPUT_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned Deal',
  SUBMITTED: 'Submitted',
  SUBMISSION_ACKNOWLEDGED: 'Acknowledged by UKEF',
  APPROVED: 'Accepted by UKEF (without conditions)',
  APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  REFUSED: 'Rejected by UKEF',
  CONFIRMED_BY_BANK: 'Confirmed by bank',
  CONFIRMATION_ACKNOWLEDGED: 'Confirmation acknowledged',

};

module.exports = {
  SME_TYPE,
  SUPPLIER_TYPE,
  APPLICATION_GROUP,
  SUBMISSION_TYPE,
  ACTION_NAME,
  STATUS,
};

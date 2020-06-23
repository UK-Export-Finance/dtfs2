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

module.exports = {
  SME_TYPE,
  SUPPLIER_TYPE,
  APPLICATION_GROUP,
  SUBMISSION_TYPE,
  ACTION_NAME,
};

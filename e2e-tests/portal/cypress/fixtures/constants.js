const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

const DEAL_STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  UKEF_IN_PROGRESS: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
};

const SECTION_STATUS = {
  NOT_STARTED: 'Not started',
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
  BOND: 'Bond',
  LOAN: 'Loan',
};

const FACILITY_STAGE = {
  UNISSUED: 'Unissued',
  ISSUED: 'Issued',
  CONDITIONAL: 'Conditional',
  UNCONDITIONAL: 'Unconditional',
};

const COMPANIES_HOUSE_NUMBERS = {
  1: '06771815',
};

const INDUSTRY_SECTOR_CODES = {
  INFORMATION: '1009',
  BUSINESS: '62012',
};

const USER_ROLES = {
  ADMIN: 'admin',
  MAKER: 'maker',
  CHECKER: 'checker',
  READ_ONLY: 'read-only',
};

module.exports = {
  DEALS: {
    DEAL_TYPE,
    DEAL_STATUS,
    SUBMISSION_TYPE,
    SECTION_STATUS,
  },
  FACILITY: {
    FACILITY_TYPE,
    FACILITY_STAGE,
  },
  COMPANIES_HOUSE_NUMBERS,
  INDUSTRY_SECTOR_CODES,
  USER_ROLES,
};

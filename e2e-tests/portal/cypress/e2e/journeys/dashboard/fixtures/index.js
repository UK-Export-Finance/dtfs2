const { DEAL_STATUS, DEAL_SUBMISSION_TYPE, DEAL_TYPE, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { FACILITY_STATUS } = require('@ukef/dtfs2-common');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

const BASE_DEAL = {
  bank: { id: BANK1_MAKER1.bank.id },
  additionalRefName: 'Mock',
  exporter: {
    companyName: 'Mock company name',
  },
};

const BSS_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: DEAL_TYPE.BSS_EWCS,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
};

const GEF_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: DEAL_TYPE.GEF,
};

const BSS_DEAL_DRAFT = {
  ...BSS_DEAL_BASE,
  status: DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft BSS',
};

const BSS_DEAL_READY_FOR_CHECK = {
  ...BSS_DEAL_BASE,
  status: DEAL_STATUS.READY_FOR_APPROVAL,
  bankInternalRefName: 'Ready Check BSS',
};

const BSS_DEAL_CANCELLED = {
  ...BSS_DEAL_BASE,
  status: DEAL_STATUS.CANCELLED,
  bankInternalRefName: 'Cancelled deal',
};

const BSS_DEAL_AIN = {
  ...BSS_DEAL_BASE,
  status: DEAL_STATUS.DRAFT,
  bankInternalRefName: 'AIN BSS',
};

const BSS_DEAL_MIA = {
  ...BSS_DEAL_BASE,
  submissionType: DEAL_SUBMISSION_TYPE.MIA,
  bankInternalRefName: 'MIA BSS',
};

const GEF_DEAL_DRAFT = {
  ...GEF_DEAL_BASE,
  status: DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft GEF',
};

const BSS_FACILITY_BOND = {
  type: FACILITY_TYPE.BOND,
};

const BSS_FACILITY_BOND_ISSUED = {
  type: FACILITY_TYPE.BOND,
  hasBeenIssued: true,
};

const BSS_FACILITY_BOND_UNISSUED = {
  type: FACILITY_TYPE.BOND,
  hasBeenIssued: false,
};

const BSS_FACILITY_BOND_ISSUED_RISK_EXPIRED = {
  type: FACILITY_TYPE.BOND,
  hasBeenIssued: true,
  facilityStage: FACILITY_STATUS.RISK_EXPIRED,
};

const BSS_FACILITY_BOND_UNISSUED_RISK_EXPIRED = {
  type: FACILITY_TYPE.BOND,
  hasBeenIssued: false,
  facilityStage: FACILITY_STATUS.RISK_EXPIRED,
};

const BSS_FACILITY_LOAN = {
  type: FACILITY_TYPE.LOAN,
};

const GEF_FACILITY_CASH = {
  type: FACILITY_TYPE.CASH,
};

const GEF_FACILITY_CONTINGENT = {
  type: FACILITY_TYPE.CONTINGENT,
};

module.exports = {
  BSS_DEAL_DRAFT,
  BSS_DEAL_READY_FOR_CHECK,
  BSS_DEAL_AIN,
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
  BSS_DEAL_CANCELLED,
  BSS_FACILITY_BOND,
  BSS_FACILITY_BOND_ISSUED,
  BSS_FACILITY_BOND_UNISSUED,
  BSS_FACILITY_BOND_ISSUED_RISK_EXPIRED,
  BSS_FACILITY_BOND_UNISSUED_RISK_EXPIRED,
  BSS_FACILITY_LOAN,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
};

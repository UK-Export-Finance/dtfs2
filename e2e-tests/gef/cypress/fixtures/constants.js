const DEAL_TYPE = {
  GEF: 'GEF',
  BSS_EWCS: 'BSS/EWCS',
};

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
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  CHANGES_REQUIRED: 'Further Maker\'s input required',
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

const FACILITY_TYPE = {
  CASH: 'Cash',
  CONTINGENT: 'Contingent',
};

const DEAL_COMMENT_TYPE_PORTAL = {
  UKEF_COMMENT: 'ukefComments',
  UKEF_DECISION: 'ukefDecision',
};

const PORTAL_ACTIVITY_LABEL = {
  MIA_SUBMISSION: 'Manual inclusion application submitted to UKEF',
  MIN_SUBMISSION: 'Manual inclusion notice submitted to UKEF',
  AIN_SUBMISSION: 'Automatic inclusion notice submitted to UKEF',
  FACILITY_CHANGED_ISSUED: 'Bank facility stage changed',
};

const POSTCODE = 'E1 6JE';

const COMPANIES_HOUSE_NUMBERS = {
  VALID: '06388542',
  VALID_WITH_LETTERS: 'SC532834',
  INVALID_TOO_SHORT: '89898',
  INVALID_WITH_SPACE: '8989898 ',
  INVALID_SPECIAL_CHARACTERS: 'R$00592C',
};

module.exports = {
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_COMMENT_TYPE_PORTAL,
  PORTAL_ACTIVITY_LABEL,
  POSTCODE,
  COMPANIES_HOUSE_NUMBERS,
};

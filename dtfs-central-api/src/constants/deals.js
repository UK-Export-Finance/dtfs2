const DEAL_TYPE = {
  BSS_EWCS: 'BSS/EWCS',
  GEF: 'GEF',
};

const DEAL_STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
};

const SUBMISSION_TYPE = {
  AIN: 'Automatic Inclusion Notice',
  MIA: 'Manual Inclusion Application',
  MIN: 'Manual Inclusion Notice',
};

const SORT_BY = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

module.exports = {
  DEAL_TYPE,
  DEAL_STATUS,
  SUBMISSION_TYPE,
  SORT_BY,
};

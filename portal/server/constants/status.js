const DEAL = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  ABANDONED: 'Abandoned',
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Accepted by UKEF (without conditions)',
  UKEF_APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  UKEF_REFUSED: 'Rejected by UKEF',
  CANCELLED: 'Cancelled',
};

const SECTION = {
  COMPLETED: 'Completed',
  NOT_COMPLETED: 'Not completed',
};

module.exports = {
  DEAL,
  SECTION,
};

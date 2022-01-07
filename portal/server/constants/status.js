const STATUS = {
  DRAFT: 'Draft',
  READY_FOR_APPROVAL: 'Ready for Checker\'s approval',
  INPUT_REQUIRED: 'Further Maker\'s input required',
  ABANDONED: 'Abandoned',
  SUBMITTED: 'Submitted',
  SUBMISSION_ACKNOWLEDGED: 'Acknowledged by UKEF',
  IN_PROGRESS_BY_UKEF: 'In progress by UKEF',
  APPROVED: 'Accepted by UKEF (without conditions)',
  APPROVED_WITH_CONDITIONS: 'Accepted by UKEF (with conditions)',
  REFUSED: 'Rejected by UKEF',
};

module.exports = STATUS;

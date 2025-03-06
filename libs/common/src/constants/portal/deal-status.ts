export const DEAL_STATUS = {
  DRAFT: 'Draft',
  ABANDONED: 'Abandoned',
  READY_FOR_APPROVAL: "Ready for Checker's approval",
  CHANGES_REQUIRED: "Further Maker's input required",
  SUBMITTED_TO_UKEF: 'Submitted',
  UKEF_ACKNOWLEDGED: 'Acknowledged',
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
  CANCELLED: 'Cancelled',
  PENDING_CANCELLATION: 'Pending cancellation',
} as const;

export const DEAL_STATUS_SCHEDULED_OR_CANCELLED = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];

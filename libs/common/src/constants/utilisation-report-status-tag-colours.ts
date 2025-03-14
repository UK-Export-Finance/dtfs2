import { KEYING_SHEET_ROW_STATUS } from './keying-sheet-row-status';
import { RECORD_CORRECTION_STATUS } from './record-correction-status';
import { FEE_RECORD_STATUS } from './fee-record-status';
import { REPORT_NOT_RECEIVED, PENDING_RECONCILIATION, RECONCILIATION_IN_PROGRESS, RECONCILIATION_COMPLETED } from './utilisation-report-status';

export const UTILISATION_REPORT_STATUS_TAG_COLOURS = {
  [RECORD_CORRECTION_STATUS.RECEIVED]: 'govuk-tag--green',
  [RECORD_CORRECTION_STATUS.SENT]: 'govuk-tag--grey',
  [FEE_RECORD_STATUS.TO_DO]: 'govuk-tag--grey',
  [FEE_RECORD_STATUS.TO_DO_AMENDED]: 'govuk-tag--grey',
  [FEE_RECORD_STATUS.MATCH]: 'govuk-tag--green',
  [FEE_RECORD_STATUS.DOES_NOT_MATCH]: 'govuk-tag--red',
  [FEE_RECORD_STATUS.READY_TO_KEY]: 'govuk-tag--blue',
  [FEE_RECORD_STATUS.RECONCILED]: 'govuk-tag--grey',
  [FEE_RECORD_STATUS.PENDING_CORRECTION]: 'govuk-tag--grey',
  [KEYING_SHEET_ROW_STATUS.DONE]: 'govuk-tag--green',
  [REPORT_NOT_RECEIVED]: 'govuk-tag--red',
  [PENDING_RECONCILIATION]: 'govuk-tag--grey',
  [RECONCILIATION_IN_PROGRESS]: 'govuk-tag--blue',
  [RECONCILIATION_COMPLETED]: 'govuk-tag--green',
} as const;

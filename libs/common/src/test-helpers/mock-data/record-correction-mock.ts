import { RECORD_CORRECTION_REASON, FEE_RECORD_STATUS } from '../../constants';
import { FeeRecordCorrectionSummary } from '../../types';

/**
 * Mock data for fee record correction details
 * Created in dtfs-central-api and requested by tfm
 */
export const mockRecordCorrectionDetails: FeeRecordCorrectionSummary[] = [
  {
    correctionId: 1,
    feeRecordId: 12,
    exporter: 'test exporter',
    formattedReasons: RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
    formattedDateSent: new Date().toISOString(),
    status: FEE_RECORD_STATUS.PENDING_CORRECTION,
    formattedOldRecords: '101111',
    formattedCorrectRecords: '-',
  },
  {
    correctionId: 2,
    feeRecordId: 13,
    exporter: 'test exporter 1',
    formattedReasons: RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
    formattedDateSent: new Date().toISOString(),
    status: FEE_RECORD_STATUS.PENDING_CORRECTION,
    formattedOldRecords: '101112',
    formattedCorrectRecords: '-',
  },
];

import { RECORD_CORRECTION_REASON } from '../../constants';
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
    isCompleted: false,
    formattedOldRecords: '101111',
    formattedCorrectRecords: '-',
  },
  {
    correctionId: 2,
    feeRecordId: 13,
    exporter: 'test exporter 1',
    formattedReasons: RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
    formattedDateSent: new Date().toISOString(),
    isCompleted: false,
    formattedOldRecords: '101112',
    formattedCorrectRecords: '-',
  },
];

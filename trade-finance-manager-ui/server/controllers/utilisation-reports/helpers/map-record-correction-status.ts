import { RECORD_CORRECTION_DISPLAY_STATUS, RECORD_CORRECTION_STATUS, RecordCorrectionStatus, RecordCorrectionDisplayStatus } from '@ukef/dtfs2-common';

/**
 * returns displayStatus and status
 * based on if record correction is completed or not
 * @param isCompleted - if record correction is completed
 * @returns displayStatus and status
 */
export const mapToRecordCorrectionStatus = (isCompleted: boolean) => {
  const recordCorrectionDisplayStatusSent: RecordCorrectionDisplayStatus = RECORD_CORRECTION_DISPLAY_STATUS.SENT;
  const recordCorrectionDisplayStatusReceived: RecordCorrectionDisplayStatus = RECORD_CORRECTION_DISPLAY_STATUS.RECEIVED;

  const recordCorrectionStatusSent: RecordCorrectionStatus = RECORD_CORRECTION_STATUS.SENT;
  const recordCorrectionStatusReceived: RecordCorrectionStatus = RECORD_CORRECTION_STATUS.RECEIVED;

  if (isCompleted) {
    return {
      displayStatus: recordCorrectionDisplayStatusReceived,
      status: recordCorrectionStatusReceived,
    };
  }

  return {
    displayStatus: recordCorrectionDisplayStatusSent,
    status: recordCorrectionStatusSent,
  };
};

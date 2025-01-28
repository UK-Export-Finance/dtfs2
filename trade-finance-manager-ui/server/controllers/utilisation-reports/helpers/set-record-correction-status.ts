import { RecordCorrectionStatus, RecordCorrectionDisplayStatus } from '../../../types/view-models';

/**
 * returns displayStatus and status
 * based on if record correction is completed or not
 * @param isCompleted - if record correction is completed
 * @returns displayStatus and status
 */
export const setRecordCorrectionStatus = (isCompleted: boolean) => {
  const recordCorrectionDisplayStatusSent: RecordCorrectionDisplayStatus = 'Record correction sent';
  const recordCorrectionDisplayStatusReceived: RecordCorrectionDisplayStatus = 'Record correction received';

  const recordCorrectionStatusSent: RecordCorrectionStatus = 'RECORD_CORRECTION_SENT';
  const recordCorrectionStatusReceived: RecordCorrectionStatus = 'RECORD_CORRECTION_RECEIVED';

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

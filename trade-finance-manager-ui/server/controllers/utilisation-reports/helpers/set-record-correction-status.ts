/**
 * returns the record correction status string
 * based on if record correction is completed or not
 * @param isCompleted - if record correction is completed
 * @returns 'Record correction sent' or 'Record correction received'
 */
export const setRecordCorrectionDisplayStatus = (isCompleted: boolean) => {
  const recordCorrectionSent = 'Record correction sent';
  const recordCorrectionReceived = 'Record correction received';

  if (isCompleted) {
    return recordCorrectionReceived;
  }

  return recordCorrectionSent;
};

/**
 * sets the record correction status based on isCompleted
 * if true, then returns RECORD_CORRECTION_RECEIVED
 * else returns RECORD_CORRECTION_SENT
 * @param isCompleted - if record correction is completed
 * @returns RECORD_CORRECTION_RECEIVED if completed else RECORD_CORRECTION_SENT
 */
export const setRecordCorrectionStatus = (isCompleted: boolean) => {
  const recordCorrectionSent = 'RECORD_CORRECTION_SENT';
  const recordCorrectionReceived = 'RECORD_CORRECTION_RECEIVED';

  if (isCompleted) {
    return recordCorrectionReceived;
  }

  return recordCorrectionSent;
};

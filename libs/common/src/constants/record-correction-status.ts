export type RecordCorrectionDisplayStatus = 'Record correction sent' | 'Record correction received';

export type RecordCorrectionStatus = 'RECORD_CORRECTION_SENT' | 'RECORD_CORRECTION_RECEIVED';

export const RECORD_CORRECTION_DISPLAY_STATUS: { SENT: RecordCorrectionDisplayStatus; RECEIVED: RecordCorrectionDisplayStatus } = {
  SENT: 'Record correction sent',
  RECEIVED: 'Record correction received',
};

export const RECORD_CORRECTION_STATUS: { SENT: RecordCorrectionStatus; RECEIVED: RecordCorrectionStatus } = {
  SENT: 'RECORD_CORRECTION_SENT',
  RECEIVED: 'RECORD_CORRECTION_RECEIVED',
};

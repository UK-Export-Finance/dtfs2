import { setRecordCorrectionStatus, setRecordCorrectionDisplayStatus } from './set-record-correction-status';

describe('set-record=correction-status', () => {
  describe('setRecordCorrectionStatus', () => {
    describe('isCompleted is true', () => {
      it('should return RECORD_CORRECTION_RECEIVED', () => {
        const result = setRecordCorrectionStatus(true);

        expect(result).toEqual('RECORD_CORRECTION_RECEIVED');
      });
    });

    describe('isCompleted is false', () => {
      it('should return RECORD_CORRECTION_SENT', () => {
        const result = setRecordCorrectionStatus(false);

        expect(result).toEqual('RECORD_CORRECTION_SENT');
      });
    });
  });

  describe('setRecordCorrectionDisplayStatus', () => {
    describe('isCompleted is true', () => {
      it('should return "Record correction received"', () => {
        const result = setRecordCorrectionDisplayStatus(true);

        expect(result).toEqual('Record correction received');
      });
    });

    describe('isCompleted is false', () => {
      it('should return "Record correction sent"', () => {
        const result = setRecordCorrectionDisplayStatus(false);

        expect(result).toEqual('Record correction sent');
      });
    });
  });
});

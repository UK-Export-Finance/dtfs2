import { setRecordCorrectionStatus } from './set-record-correction-status';

describe('set-record=correction-status', () => {
  describe('setRecordCorrectionStatus', () => {
    describe('isCompleted is true', () => {
      it('should return "RECORD_CORRECTION_RECEIVED" and "Record correction received"', () => {
        const result = setRecordCorrectionStatus(true);

        const expected = {
          displayStatus: 'Record correction received',
          status: 'RECORD_CORRECTION_RECEIVED',
        };

        expect(result).toEqual(expected);
      });
    });

    describe('isCompleted is false', () => {
      it('should return "RECORD_CORRECTION_SENT" and "Record correction sent"', () => {
        const result = setRecordCorrectionStatus(false);

        const expected = {
          displayStatus: 'Record correction sent',
          status: 'RECORD_CORRECTION_SENT',
        };

        expect(result).toEqual(expected);
      });
    });
  });
});

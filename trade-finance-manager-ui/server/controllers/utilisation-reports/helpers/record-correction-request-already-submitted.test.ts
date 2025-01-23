import { STATUS, feeRecordCorrectionRequestReviewResponseBodyMock } from '@ukef/dtfs2-common';
import { recordCorrectionRequestAlreadySubmitted } from './record-correction-request-already-submitted';

describe('record-correction-request-already-submitted', () => {
  describe(`when errorKey with status ${STATUS.INVALID} is NOT provided`, () => {
    it('should return false', () => {
      const result = recordCorrectionRequestAlreadySubmitted(feeRecordCorrectionRequestReviewResponseBodyMock);

      expect(result).toEqual(false);
    });
  });

  describe('when errorKey with a different status is provided', () => {
    it('should return false', () => {
      const result = recordCorrectionRequestAlreadySubmitted({ errorKey: 'abc' });

      expect(result).toEqual(false);
    });
  });

  describe(`when errorKey with status ${STATUS.INVALID} is provided`, () => {
    it('should return true', () => {
      const result = recordCorrectionRequestAlreadySubmitted({ errorKey: STATUS.INVALID });

      expect(result).toEqual(true);
    });
  });
});

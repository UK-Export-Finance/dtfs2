import { ERROR_KEY, feeRecordCorrectionRequestReviewResponseBodyMock } from '@ukef/dtfs2-common';
import { recordCorrectionRequestAlreadySubmitted } from './record-correction-request-already-submitted';

describe('record-correction-request-already-submitted', () => {
  describe(`when errorKey with status ${ERROR_KEY.INVALID_STATUS} is NOT provided`, () => {
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

  describe(`when errorKey with status ${ERROR_KEY.INVALID_STATUS} is provided`, () => {
    it('should return true', () => {
      const result = recordCorrectionRequestAlreadySubmitted({ errorKey: ERROR_KEY.INVALID_STATUS });

      expect(result).toEqual(true);
    });
  });
});

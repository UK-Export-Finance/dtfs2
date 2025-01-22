import { STATUS, feeRecordCorrectionRequestReviewResponseBodyMock } from '@ukef/dtfs2-common';
import { isRecordCorrectionRequestReviewResponseType } from './is-record-correction-request-review-response-type';

describe('is-record-correction-request-review-response-type', () => {
  describe(`when errorKey is NOT provided`, () => {
    it('should return true', () => {
      const result = isRecordCorrectionRequestReviewResponseType(feeRecordCorrectionRequestReviewResponseBodyMock);

      expect(result).toEqual(true);
    });
  });

  describe(`when errorKey is provided`, () => {
    it('should return false', () => {
      const result = isRecordCorrectionRequestReviewResponseType({ errorKey: STATUS.INVALID });

      expect(result).toEqual(false);
    });
  });
});

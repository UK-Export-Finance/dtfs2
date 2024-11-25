import { RECORD_CORRECTION_REQUEST_REASON } from '@ukef/dtfs2-common';
import {
  CreateRecordCorrectionRequestFormRequestBody,
  extractCreateRecordCorrectionRequestFormValues,
  extractRecordCorrectionRequestReasons,
  isRecordCorrectionRequestReason,
} from './form-helpers';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request/form-helpers', () => {
  describe('extractCreateRecordCorrectionRequestFormValues', () => {
    it('should extract the expected form values', () => {
      // Arrange
      const validReasons = [RECORD_CORRECTION_REQUEST_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REQUEST_REASON.REPORTED_CURRENCY_INCORRECT];
      const additionalInfo = 'additional info';

      const requestBody: CreateRecordCorrectionRequestFormRequestBody = {
        reasons: [...validReasons, 'invalid-reason'],
        additionalInfo,
      };

      // Act
      const formValues = extractCreateRecordCorrectionRequestFormValues(requestBody);

      // Assert
      expect(formValues).toEqual({
        reasons: validReasons,
        additionalInfo,
      });
    });
  });

  describe('extractRecordCorrectionRequestReasons', () => {
    describe('when reasons is undefined', () => {
      it('should return an empty array', () => {
        // Act
        const validReasons = extractRecordCorrectionRequestReasons();

        // Assert
        expect(validReasons).toEqual([]);
      });
    });

    describe('when reasons is a string', () => {
      describe('and the reason is a RECORD_CORRECTION_REQUEST_REASON', () => {
        it('should return the reason in an array', () => {
          // Arrange
          const reason = RECORD_CORRECTION_REQUEST_REASON.FACILITY_ID_INCORRECT;

          // Act
          const validReasons = extractRecordCorrectionRequestReasons(reason);

          // Assert
          expect(validReasons).toEqual([reason]);
        });
      });

      describe('and the reason is not a RECORD_CORRECTION_REQUEST_REASON', () => {
        it('should return an empty array', () => {
          // Arrange
          const reason = 'invalid-reason';

          // Act
          const validReasons = extractRecordCorrectionRequestReasons(reason);

          // Assert
          expect(validReasons).toEqual([]);
        });
      });
    });

    describe('when reasons is a string list', () => {
      describe('and the reasons are all a RECORD_CORRECTION_REQUEST_REASON', () => {
        it('should return the input array', () => {
          // Arrange
          const reasons = Object.values(RECORD_CORRECTION_REQUEST_REASON);

          // Act
          const validReasons = extractRecordCorrectionRequestReasons(reasons);

          // Assert
          expect(validReasons).toEqual(reasons);
        });
      });

      describe('and some of the reasons are not a RECORD_CORRECTION_REQUEST_REASON', () => {
        it('should return an array with only the reasons contained within RECORD_CORRECTION_REQUEST_REASON', () => {
          // Arrange
          const reasons = [
            'invalid-reason',
            RECORD_CORRECTION_REQUEST_REASON.REPORTED_CURRENCY_INCORRECT,
            'another-invalid-reason',
            RECORD_CORRECTION_REQUEST_REASON.OTHER,
          ];

          // Act
          const validReasons = extractRecordCorrectionRequestReasons(reasons);

          // Assert
          expect(validReasons).toEqual([RECORD_CORRECTION_REQUEST_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REQUEST_REASON.OTHER]);
        });
      });

      describe('and the reasons are all not a RECORD_CORRECTION_REQUEST_REASON', () => {
        it('should return an empty array', () => {
          // Arrange
          const reasons = ['invalid-reason', 'another-invalid-reason'];

          // Act
          const validReasons = extractRecordCorrectionRequestReasons(reasons);

          // Assert
          expect(validReasons).toEqual([]);
        });
      });
    });
  });

  describe('isRecordCorrectionRequestReason', () => {
    describe('when the reason is an empty string', () => {
      it('should return false', () => {
        // Arrange
        const reason = '';

        // Act
        const isValid = isRecordCorrectionRequestReason(reason);

        // Assert
        expect(isValid).toEqual(false);
      });
    });

    describe('when the reason is a RECORD_CORRECTION_REQUEST_REASON', () => {
      it.each(Object.values(RECORD_CORRECTION_REQUEST_REASON))('should return true for "%s"', (reason) => {
        // Act
        const isValid = isRecordCorrectionRequestReason(reason);

        // Assert
        expect(isValid).toEqual(true);
      });
    });

    describe('when the reason is not a RECORD_CORRECTION_REQUEST_REASON', () => {
      it('should return false', () => {
        // Arrange
        const reason = 'invalid-reason';

        // Act
        const isValid = isRecordCorrectionRequestReason(reason);

        // Assert
        expect(isValid).toEqual(false);
      });
    });
  });
});

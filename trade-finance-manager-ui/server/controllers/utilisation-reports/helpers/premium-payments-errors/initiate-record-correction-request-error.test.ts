import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-error-href';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getInitiateRecordCorrectionRequestError, validateInitiateRecordCorrectionErrorKey } from './initiate-record-correction-request-error';
import { InitiateRecordCorrectionRequestErrorKey } from '../../../../types/premium-payments-tab-error-keys';

describe('initiate-record-correction-request-error', () => {
  describe('getInitiateFeeRecordCorrectionRequestError', () => {
    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual('Select one fee for a fee record correction request');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });

    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a record to create a record correction request');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });

    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual("Select a fee in 'To do' status to create a record correction request");
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });
  });

  describe('validateInitiateRecordCorrectionErrorKey', () => {
    it('should throw when provided string is not a valid initiate record correction request error key', () => {
      // Arrange
      const invalidKey = 'not-a-valid-key';

      // Act + Assert
      expect(() => validateInitiateRecordCorrectionErrorKey(invalidKey)).toThrow(
        new Error(`Unrecognised initiate record correction request error key '${invalidKey}'`),
      );
    });

    it.each(Object.values(INITIATE_RECORD_CORRECTION_ERROR_KEY))(
      'should return true when given string is a valid initiate record correction request error key',
      (initiateRecordCorrectionRequestErrorKey: InitiateRecordCorrectionRequestErrorKey) => {
        // Act
        const result = validateInitiateRecordCorrectionErrorKey(initiateRecordCorrectionRequestErrorKey);

        // Assert
        expect(result).toEqual(true);
      },
    );
  });
});

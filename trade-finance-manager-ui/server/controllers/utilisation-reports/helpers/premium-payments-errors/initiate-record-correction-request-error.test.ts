import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getInitiateRecordCorrectionRequestError } from './initiate-record-correction-request-error';

describe('initiate-record-correction-request-error', () => {
  describe('getInitiateFeeRecordCorrectionRequestError', () => {
    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual('Select one fee for a fee record correction request');
      expect(error.href).toEqual('#premium-payments-table-error');
    });

    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a record to create a record correction request');
      expect(error.href).toEqual('#premium-payments-table-error');
    });

    it(`returns the error text and href when the error key is '${INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS}'`, () => {
      // Arrange
      const errorKey = INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS;

      // Act
      const error = getInitiateRecordCorrectionRequestError(errorKey);

      // Assert
      expect(error.text).toEqual("Select a fee in 'To do' status to create a record correction request");
      expect(error.href).toEqual('#premium-payments-table-error');
    });
  });
});

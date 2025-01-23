import { CURRENCY, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { getFormKeyForReason, getFormValueForReason } from './extract-record-correction-transient-form-values';

describe('extract-record-correction-transient-form-values', () => {
  describe('getFormKeyForReason', () => {
    it(`should return "facilityId" when reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act
      const formFieldKey = getFormKeyForReason(reason);

      // Assert
      expect(formFieldKey).toEqual('facilityId');
    });

    it(`should return "reportedCurrency" when reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;

      // Act
      const formFieldKey = getFormKeyForReason(reason);

      // Assert
      expect(formFieldKey).toEqual('reportedCurrency');
    });

    it(`should return "reportedFee" when reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act
      const formFieldKey = getFormKeyForReason(reason);

      // Assert
      expect(formFieldKey).toEqual('reportedFee');
    });

    it(`should return "utilisation" when reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;

      // Act
      const formFieldKey = getFormKeyForReason(reason);

      // Assert
      expect(formFieldKey).toEqual('utilisation');
    });

    it(`should return "additionalComments" when reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.OTHER;

      // Act
      const formFieldKey = getFormKeyForReason(reason);

      // Assert
      expect(formFieldKey).toEqual('additionalComments');
    });

    it('should throw error for invalid reason', () => {
      // Arrange
      const reason = 'INVALID_REASON' as RecordCorrectionReason;

      // Act & Assert
      expect(() => getFormKeyForReason(reason)).toThrow('Invalid record correction reason: INVALID_REASON');
    });
  });

  describe('getFormValueForReason', () => {
    it(`should return facilityId when reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
      // Arrange
      const facilityId = '12345678';
      const formValues = { facilityId };
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(facilityId);
    });

    it(`should return reportedCurrency when reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
      // Arrange
      const reportedCurrency = CURRENCY.GBP;
      const formValues = { reportedCurrency };
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(reportedCurrency);
    });

    it(`should return reportedFee when reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
      // Arrange
      const reportedFee = '1,234.56';
      const formValues = { reportedFee };
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(reportedFee);
    });

    it(`should return utilisation when reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
      // Arrange
      const utilisation = '10,000.23';
      const formValues = { utilisation };
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(utilisation);
    });

    it(`should return additionalComments when reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      // Arrange
      const additionalComments = 'An additional bank comment';
      const formValues = { additionalComments };
      const reason = RECORD_CORRECTION_REASON.OTHER;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toEqual(additionalComments);
    });

    it('should return undefined when form value is not present for reason', () => {
      // Arrange
      const formValues = {};
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act
      const result = getFormValueForReason(formValues, reason);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw error for invalid reason', () => {
      // Arrange
      const formValues = {};
      const reason = 'INVALID_REASON' as RecordCorrectionReason;

      // Act & Assert
      expect(() => getFormValueForReason(formValues, reason)).toThrow('Invalid record correction reason: INVALID_REASON');
    });
  });
});

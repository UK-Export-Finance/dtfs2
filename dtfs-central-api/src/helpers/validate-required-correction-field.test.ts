import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { validateRequiredCorrectionField } from './validate-required-correction-field';

console.error = jest.fn();

describe('validate-required-correction-field helpers', () => {
  describe('validateRequiredCorrectionField', () => {
    it('should not throw error when value is defined and not null', () => {
      // Arrange
      const value = 'test';
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredCorrectionField(value, reason)).not.toThrow();
    });

    it('should not throw error when value is zero', () => {
      // Arrange
      const value = 0;
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredCorrectionField(value, reason)).not.toThrow();
    });

    it('should throw error when value is undefined', () => {
      // Arrange
      const value = undefined;
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const expectedError = `Required field is missing value for correction reason: ${reason}`;

      // Act & Assert
      expect(() => validateRequiredCorrectionField(value, reason)).toThrow(expectedError);
    });

    it('should not throw error when value is false', () => {
      // Arrange
      const value = false;
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredCorrectionField(value, reason)).not.toThrow();
    });

    it('should throw error when value is null', () => {
      // Arrange
      const value = null;
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const expectedError = `Required field is missing value for correction reason: ${reason}`;

      // Act & Assert
      expect(() => validateRequiredCorrectionField(value, reason)).toThrow(expectedError);
    });
  });
});

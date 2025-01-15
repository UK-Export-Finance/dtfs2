import { CURRENCY, getFormattedMonetaryValue, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getFormattedFormDataValueForCorrectionReason, validateRequiredFormDataField } from './format-form-data-value-for-reason';

console.error = jest.fn();

describe('get-fee-record-correction-review.controller format-form-data-value-for-reason helpers', () => {
  describe('validateRequiredFormDataField', () => {
    it('should not throw error when value is defined and not null', () => {
      // Arrange
      const value = 'test';
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredFormDataField(value, reason)).not.toThrow();
    });

    it('should not throw error when value is zero', () => {
      // Arrange
      const value = 0;
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredFormDataField(value, reason)).not.toThrow();
    });

    it('should throw error when value is undefined', () => {
      // Arrange
      const value = undefined;
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const expectedError = `Required field is missing from transient form data for correction reason: ${reason}`;

      // Act & Assert
      expect(() => validateRequiredFormDataField(value, reason)).toThrow(expectedError);
    });

    it('should not throw error when value is false', () => {
      // Arrange
      const value = false;
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;

      // Act & Assert
      expect(() => validateRequiredFormDataField(value, reason)).not.toThrow();
    });

    it('should throw error when value is null', () => {
      // Arrange
      const value = null;
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const expectedError = `Required field is missing from transient form data for correction reason: ${reason}`;

      // Act & Assert
      expect(() => validateRequiredFormDataField(value, reason)).toThrow(expectedError);
    });
  });

  describe('getFormattedFormDataValueForCorrectionReason', () => {
    const reasonsExcludingOther = difference(Object.values(RECORD_CORRECTION_REASON), [RECORD_CORRECTION_REASON.OTHER]);

    it(`should return the form data facilityId value for reason "${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const facilityId = 'some-value';
      const formData = {
        facilityId,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(facilityId);
    });

    it(`should return the form data reportedCurrency value for reason "${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;
      const reportedCurrency = CURRENCY.GBP;
      const formData = {
        reportedCurrency,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(reportedCurrency);
    });

    it(`should map form data reportedFee value to formatted monetary value for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;
      const reportedFee = 123.45;
      const formData = {
        reportedFee,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(reportedFee));
    });

    it(`should map form data reportedFee value of 0 to formatted monetary value for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;
      const reportedFee = 0;
      const formData = {
        reportedFee,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(reportedFee));
    });

    it(`should map form data utilisation value to formatted monetary value for reason "${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const utilisation = 10000.23;
      const formData = {
        utilisation,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(utilisation));
    });

    it(`should map form data utilisation value of 0 to formatted monetary value for reason "${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const utilisation = 0;
      const formData = {
        utilisation,
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(utilisation));
    });

    it(`should map form data additionalComments value to a hyphen character for reason "${RECORD_CORRECTION_REASON.OTHER}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.OTHER;
      const formData = {
        additionalComments: 'Some additional bank comments',
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual('-');
    });

    it.each(reasonsExcludingOther)('should throw error when required value for reason "%s" is missing from the transient form data', (reason) => {
      // Arrange
      const formData = {};

      // Act & Assert
      expect(() => getFormattedFormDataValueForCorrectionReason(formData, reason)).toThrow();
    });
  });
});

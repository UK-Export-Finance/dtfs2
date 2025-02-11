import { anEmptyRecordCorrectionTransientFormData, CURRENCY, getFormattedMonetaryValue, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getFormattedFormDataValueForCorrectionReason } from './format-form-data-value-for-reason';

console.error = jest.fn();

describe('get-fee-record-correction-review.controller format-form-data-value-for-reason helpers', () => {
  describe('getFormattedFormDataValueForCorrectionReason', () => {
    const reasonsExcludingOther = difference(Object.values(RECORD_CORRECTION_REASON), [RECORD_CORRECTION_REASON.OTHER]);

    it(`should return the form data facilityId value for reason "${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const facilityId = 'some-value';
      const formData = {
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
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
        ...anEmptyRecordCorrectionTransientFormData(),
        additionalComments: 'Some additional bank comments',
      };

      // Act
      const formattedValue = getFormattedFormDataValueForCorrectionReason(formData, reason);

      // Assert
      expect(formattedValue).toEqual('-');
    });

    it.each(reasonsExcludingOther)('should throw error when required value for reason "%s" is missing from the transient form data', (reason) => {
      // Arrange
      const formData = anEmptyRecordCorrectionTransientFormData();

      // Act & Assert
      expect(() => getFormattedFormDataValueForCorrectionReason(formData, reason)).toThrow();
    });
  });
});

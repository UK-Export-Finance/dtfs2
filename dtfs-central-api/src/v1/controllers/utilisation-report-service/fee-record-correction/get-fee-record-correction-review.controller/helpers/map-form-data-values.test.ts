import { CURRENCY, getFormattedMonetaryValue, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { mapFormDataToFormattedValues } from './map-form-data-values';

console.error = jest.fn();

describe('get-fee-record-correction-review.controller map-form-data-values helper', () => {
  describe('mapFormDataToFormattedValues', () => {
    it('should return an empty array if no reasons are provided', () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [];
      const formData = {};

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toEqual([]);
    });

    it(`should return the expected array of formatted form data values when only one reason is provided`, () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];
      const formData = {
        utilisation: 10000.23,
      };

      const expectedFormattedValues = [getFormattedMonetaryValue(formData.utilisation)];

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toHaveLength(1);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });

    it(`should return the expected array of formatted form data values when some reasons are provided`, () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];
      const formData = {
        reportedFee: 123.45,
        facilityId: '22222222',
        additionalComments: 'Some additional bank comments',
      };

      const expectedFormattedValues = [getFormattedMonetaryValue(formData.reportedFee), formData.facilityId, '-'];

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toHaveLength(3);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });

    it(`should return the expected array of formatted form data values when all reasons are provided`, () => {
      // Arrange
      const reasons = Object.values(RECORD_CORRECTION_REASON);
      const formData = {
        utilisation: 10000.23,
        reportedCurrency: CURRENCY.GBP,
        reportedFee: 123.45,
        facilityId: '11111111',
        additionalComments: 'Some additional bank comments',
      };

      const expectedFormattedValues = [
        formData.facilityId,
        formData.reportedCurrency,
        getFormattedMonetaryValue(formData.reportedFee),
        getFormattedMonetaryValue(formData.utilisation),
        '-',
      ];

      // Act
      const formattedValues = mapFormDataToFormattedValues(formData, reasons);

      // Assert
      expect(formattedValues).toHaveLength(5);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });
  });
});

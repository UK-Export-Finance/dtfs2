import { RECORD_CORRECTION_REASON, CURRENCY, getFormattedMonetaryValue, RecordCorrectionReason, aRecordCorrectionValues } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import {
  getFormattedCorrectionValueForCorrectionReason,
  mapCorrectionReasonsAndValuesToFormattedValues,
} from './map-correction-reasons-and-values-to-formatted-values';

console.error = jest.fn();

describe('get-completed-fee-record-corrections.controller map-reasons-and-values-to-formatted-values helpers', () => {
  describe('getFormattedCorrectionValueForCorrectionReason', () => {
    const reasonsExcludingOther = difference(Object.values(RECORD_CORRECTION_REASON), [RECORD_CORRECTION_REASON.OTHER]);

    it(`should return the correction values "facilityId" value for reason "${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT;
      const facilityId = 'some-value';
      const correctionValues = {
        ...aRecordCorrectionValues(),
        facilityId,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(facilityId);
    });

    it(`should return the correction values "feesPaidToUkefForThePeriodCurrency" value for reason "${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT;
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.GBP;
      const correctionValues = {
        ...aRecordCorrectionValues(),
        feesPaidToUkefForThePeriodCurrency,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(feesPaidToUkefForThePeriodCurrency);
    });

    it(`should map correction values "feesPaidToUkefForThePeriod" value to formatted monetary amount for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;
      const feesPaidToUkefForThePeriod = 123.45;
      const correctionValues = {
        ...aRecordCorrectionValues(),
        feesPaidToUkefForThePeriod,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(feesPaidToUkefForThePeriod));
    });

    it(`should map correction values "feesPaidToUkefForThePeriod" value of 0 to formatted monetary amount for reason "${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT;
      const feesPaidToUkefForThePeriod = 0;
      const correctionValues = {
        ...aRecordCorrectionValues(),
        feesPaidToUkefForThePeriod,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(feesPaidToUkefForThePeriod));
    });

    it(`should map correction values "facilityUtilisation" value to formatted monetary amount for reason "${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const facilityUtilisation = 10000.23;
      const correctionValues = {
        ...aRecordCorrectionValues(),
        facilityUtilisation,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(facilityUtilisation));
    });

    it(`should map correction values "facilityUtilisation" value of 0 to formatted monetary amount for reason "${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}"`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.UTILISATION_INCORRECT;
      const facilityUtilisation = 0;
      const correctionValues = {
        ...aRecordCorrectionValues(),
        facilityUtilisation,
      };

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual(getFormattedMonetaryValue(facilityUtilisation));
    });

    it(`should map reason "${RECORD_CORRECTION_REASON.OTHER}" to a hyphen character`, () => {
      // Arrange
      const reason = RECORD_CORRECTION_REASON.OTHER;
      const correctionValues = aRecordCorrectionValues();

      // Act
      const formattedValue = getFormattedCorrectionValueForCorrectionReason(correctionValues, reason);

      // Assert
      expect(formattedValue).toEqual('-');
    });

    it.each(reasonsExcludingOther)('should throw error when required value for reason "%s" is set to "null" in the correction values', (reason) => {
      // Arrange
      const correctionValues = {
        facilityId: null,
        facilityUtilisation: null,
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
      };

      // Act & Assert
      expect(() => getFormattedCorrectionValueForCorrectionReason(correctionValues, reason)).toThrow();
    });
  });

  describe('mapCorrectionReasonsAndValuesToFormattedValues', () => {
    it('should return an empty array if no reasons are provided', () => {
      // Arrange
      const reasons: RecordCorrectionReason[] = [];
      const correctionValues = aRecordCorrectionValues();

      // Act
      const formattedValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, correctionValues);

      // Assert
      expect(formattedValues).toEqual([]);
    });

    it(`should return the expected array of formatted form data values when only one reason is provided`, () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

      const facilityUtilisation = 10000.23;

      const correctionValues = {
        ...aRecordCorrectionValues(),
        facilityUtilisation,
      };

      // Act
      const formattedValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, correctionValues);

      // Assert
      const expectedFormattedValues = [getFormattedMonetaryValue(facilityUtilisation)];

      expect(formattedValues).toHaveLength(1);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });

    it(`should return the expected array of formatted form data values when some reasons are provided`, () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER];

      const feesPaidToUkefForThePeriod = 10000.23;
      const facilityId = '12345678';

      const correctionValues = {
        ...aRecordCorrectionValues(),
        feesPaidToUkefForThePeriod,
        facilityId,
      };

      // Act
      const formattedValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, correctionValues);

      // Assert
      const expectedFormattedValues = [getFormattedMonetaryValue(feesPaidToUkefForThePeriod), facilityId, '-'];

      expect(formattedValues).toHaveLength(3);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });

    it(`should return the expected array of formatted form data values when all reasons are provided`, () => {
      // Arrange
      const reasons = Object.values(RECORD_CORRECTION_REASON);

      const facilityId = '12345678';
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.EUR;
      const feesPaidToUkefForThePeriod = 123.45;
      const facilityUtilisation = 100000;

      const correctionValues = {
        facilityId,
        feesPaidToUkefForThePeriodCurrency,
        feesPaidToUkefForThePeriod,
        facilityUtilisation,
      };

      // Act
      const formattedValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, correctionValues);

      // Assert
      const expectedFormattedValues = [
        facilityId,
        feesPaidToUkefForThePeriodCurrency,
        getFormattedMonetaryValue(feesPaidToUkefForThePeriod),
        getFormattedMonetaryValue(facilityUtilisation),
        '-',
      ];

      expect(formattedValues).toHaveLength(5);
      expect(formattedValues).toEqual(expectedFormattedValues);
    });
  });
});

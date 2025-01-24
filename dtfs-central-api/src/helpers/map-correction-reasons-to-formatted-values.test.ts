import { FeeRecordEntityMockBuilder, RECORD_CORRECTION_REASON, getFormattedMonetaryValue, FeeRecordCorrectionEntityMockBuilder } from '@ukef/dtfs2-common';
import {
  getFormattedCorrectValueForCorrectionReason,
  mapCorrectionReasonsToFormattedCorrectValues,
  mapCorrectionReasonsToFormattedPreviousValues,
} from './map-correction-reasons-to-formatted-values';

describe('map-correction-reasons-to-formatted-values', () => {
  const correctionId = 3;

  const feeRecord = new FeeRecordEntityMockBuilder().build();

  const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, true)
    .withId(correctionId)
    .withReasons([
      RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
      RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
      RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
      RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
      RECORD_CORRECTION_REASON.OTHER,
    ])
    .withPreviousValues({
      facilityUtilisation: 600000,
      feesPaidToUkefForThePeriod: 12345,
      feesPaidToUkefForThePeriodCurrency: 'GBP',
      facilityId: '123456',
    })
    .withCorrectedValues({
      facilityUtilisation: 100000,
      feesPaidToUkefForThePeriod: 1111,
      feesPaidToUkefForThePeriodCurrency: 'JPY',
      facilityId: '654321',
    })
    .build();

  describe('getFormattedCorrectValueForCorrectionReason', () => {
    describe('previousValues', () => {
      describe(`when the reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
        it('should return the facility id of the previousValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.previousValues, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT);
          const expected = correctionEntity.previousValues.facilityId;
          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
        it('should return feesPaidToUkefForThePeriodCurrency from the previousValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.previousValues, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT);

          const expected = correctionEntity.previousValues.feesPaidToUkefForThePeriodCurrency;

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
        it('should return feesPaidToUkefForThePeriod from the previousValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.previousValues, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT);

          const expected = getFormattedMonetaryValue(Number(correctionEntity.previousValues.feesPaidToUkefForThePeriod));

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
        it('should return facilityUtilisation from the previousValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.previousValues, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT);

          const expected = getFormattedMonetaryValue(Number(correctionEntity.previousValues.facilityUtilisation));

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
        it('should return a dash', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.previousValues, RECORD_CORRECTION_REASON.OTHER);

          expect(result).toEqual('-');
        });
      });
    });

    describe('correctValues', () => {
      describe(`when the reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
        it('should return the facility id of the correctedValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.correctedValues, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT);
          const expected = correctionEntity.correctedValues.facilityId;
          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
        it('should return feesPaidToUkefForThePeriodCurrency from the correctedValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.correctedValues, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT);

          const expected = correctionEntity.correctedValues.feesPaidToUkefForThePeriodCurrency;

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
        it('should return feesPaidToUkefForThePeriod from the correctedValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.correctedValues, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT);

          const expected = getFormattedMonetaryValue(Number(correctionEntity.correctedValues.feesPaidToUkefForThePeriod));

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
        it('should return facilityUtilisation from the correctedValues', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.correctedValues, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT);

          const expected = getFormattedMonetaryValue(Number(correctionEntity.correctedValues.facilityUtilisation));

          expect(result).toEqual(expected);
        });
      });

      describe(`when the reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
        it('should return a dash', () => {
          const result = getFormattedCorrectValueForCorrectionReason(correctionEntity.correctedValues, RECORD_CORRECTION_REASON.OTHER);

          expect(result).toEqual('-');
        });
      });
    });
  });

  describe('mapCorrectionReasonsToFormattedCorrectValues', () => {
    describe('when the reasons array contains all the reasons', () => {
      it('should return an array of the values of each correctedValue that corresponds to each reason', () => {
        const reasons = [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        const result = mapCorrectionReasonsToFormattedCorrectValues(correctionEntity, reasons);

        const expected = [
          correctionEntity.correctedValues.facilityId,
          correctionEntity.correctedValues.feesPaidToUkefForThePeriodCurrency,
          getFormattedMonetaryValue(Number(correctionEntity.correctedValues.feesPaidToUkefForThePeriod)),
          getFormattedMonetaryValue(Number(correctionEntity.correctedValues.facilityUtilisation)),
          '-',
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when the reasons array contains one reason', () => {
      it('should return an array of the value of correctedValues property that corresponds to the reason', () => {
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        const result = mapCorrectionReasonsToFormattedCorrectValues(correctionEntity, reasons);

        const expected = [correctionEntity.correctedValues.facilityId];

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reasons array only contains ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return an array with a string "-"', () => {
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        const result = mapCorrectionReasonsToFormattedCorrectValues(correctionEntity, reasons);

        const expected = ['-'];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('mapCorrectionReasonsToFormattedPreviousValues', () => {
    describe('when the reasons array contains all the reasons', () => {
      it('should return an array of the values of each previousValue that corresponds to each reason', () => {
        const reasons = [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        const result = mapCorrectionReasonsToFormattedPreviousValues(correctionEntity, reasons);

        const expected = [
          correctionEntity.previousValues.facilityId,
          correctionEntity.previousValues.feesPaidToUkefForThePeriodCurrency,
          getFormattedMonetaryValue(Number(correctionEntity.previousValues.feesPaidToUkefForThePeriod)),
          getFormattedMonetaryValue(Number(correctionEntity.previousValues.facilityUtilisation)),
          '-',
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when the reasons array contains one reason', () => {
      it('should return an array of the value of previousValues that corresponds to the reason', () => {
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        const result = mapCorrectionReasonsToFormattedPreviousValues(correctionEntity, reasons);

        const expected = [correctionEntity.previousValues.facilityId];

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reasons array only contains ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return an array with a string "-"', () => {
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        const result = mapCorrectionReasonsToFormattedPreviousValues(correctionEntity, reasons);

        const expected = ['-'];

        expect(result).toEqual(expected);
      });
    });
  });
});

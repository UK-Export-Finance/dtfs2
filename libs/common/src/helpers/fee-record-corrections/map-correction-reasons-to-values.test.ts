import { mapCorrectionReasonsToValues, correctionReasonsToValues } from './map-correction-reasons-to-values';
import { FeeRecordEntityMockBuilder } from '../../test-helpers';
import { RECORD_CORRECTION_REASON } from '../../constants';

describe('map-correction-reasons-to-values', () => {
  const feeRecord = new FeeRecordEntityMockBuilder().build();

  describe('correctionReasonsToValues', () => {
    describe(RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, () => {
      it('should return the value of the fee record property that corresponds to the reason', () => {
        const result = correctionReasonsToValues(feeRecord, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT);

        const expected = feeRecord.facilityId;

        expect(result).toEqual(expected);
      });
    });

    describe(RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, () => {
      it('should return the value of the fee record property that corresponds to the reason', () => {
        const result = correctionReasonsToValues(feeRecord, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT);

        const expected = feeRecord.totalFeesAccruedForThePeriodCurrency;

        expect(result).toEqual(expected);
      });
    });

    describe(RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, () => {
      it('should return the value of the fee record property that corresponds to the reason', () => {
        const result = correctionReasonsToValues(feeRecord, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT);

        const expected = feeRecord.totalFeesAccruedForThePeriod;

        expect(result).toEqual(expected);
      });
    });

    describe(RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, () => {
      it('should return the value of the fee record property that corresponds to the reason', () => {
        const result = correctionReasonsToValues(feeRecord, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT);

        const expected = feeRecord.facilityUtilisation;

        expect(result).toEqual(expected);
      });
    });

    describe(RECORD_CORRECTION_REASON.OTHER, () => {
      it('should return a dash', () => {
        const result = correctionReasonsToValues(feeRecord, RECORD_CORRECTION_REASON.OTHER);

        expect(result).toEqual('-');
      });
    });
  });

  describe('mapCorrectionReasonsToValues', () => {
    describe('when the reasons array contains all the reasons', () => {
      it('should return an array of the values of each fee record property that corresponds to each reason', () => {
        const reasons = [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        const result = mapCorrectionReasonsToValues(feeRecord, reasons);

        const expected = [
          feeRecord.facilityId,
          feeRecord.totalFeesAccruedForThePeriodCurrency,
          feeRecord.totalFeesAccruedForThePeriod,
          feeRecord.facilityUtilisation,
          '-',
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when the reasons array contains one reason', () => {
      it('should return an array of the value of each fee record property that corresponds to the reason', () => {
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        const result = mapCorrectionReasonsToValues(feeRecord, reasons);

        const expected = [feeRecord.facilityId];

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reasons array only contains ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return an array with a string "-"', () => {
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        const result = mapCorrectionReasonsToValues(feeRecord, reasons);

        const expected = ['-'];

        expect(result).toEqual(expected);
      });
    });
  });
});

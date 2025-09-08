import { FeeRecordEntityMockBuilder, RECORD_CORRECTION_REASON, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import {
  mapCorrectionReasonsToFormattedOldFeeRecordValues,
  getFormattedOldValueForCorrectionReason,
} from './map-correction-reasons-to-formatted-old-fee-record-values';

describe('map-correction-reasons-to-formatted-old-fee-record-values', () => {
  const feeRecord = new FeeRecordEntityMockBuilder().build();

  describe('getFormattedOldValueForCorrectionReason', () => {
    describe(`when the reason is ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}`, () => {
      it('should return the facility id of the fee record', () => {
        const result = getFormattedOldValueForCorrectionReason(feeRecord, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT);

        const expected = feeRecord.facilityId;

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT}`, () => {
      it('should return feesPaidToUkefForThePeriodCurrency from the fee record', () => {
        const result = getFormattedOldValueForCorrectionReason(feeRecord, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT);

        const expected = feeRecord.feesPaidToUkefForThePeriodCurrency;

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reason is ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}`, () => {
      it('should return feesPaidToUkefForThePeriod from the fee record', () => {
        const result = getFormattedOldValueForCorrectionReason(feeRecord, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT);

        const expected = getFormattedMonetaryValue(feeRecord.feesPaidToUkefForThePeriod);

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reason is ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}`, () => {
      it('should return facilityUtilisation from the fee record', () => {
        const result = getFormattedOldValueForCorrectionReason(feeRecord, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT);

        const expected = getFormattedMonetaryValue(feeRecord.facilityUtilisation);

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reason is ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return a dash', () => {
        const result = getFormattedOldValueForCorrectionReason(feeRecord, RECORD_CORRECTION_REASON.OTHER);

        expect(result).toEqual('-');
      });
    });
  });

  describe('mapCorrectionReasonsToFormattedOldFeeRecordValues', () => {
    describe('when the reasons array contains all the reasons', () => {
      it('should return an array of the values of each fee record property that corresponds to each reason', () => {
        const reasons = [
          RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        const result = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, reasons);

        const expected = [
          feeRecord.facilityId,
          feeRecord.totalFeesAccruedForThePeriodCurrency,
          getFormattedMonetaryValue(feeRecord.totalFeesAccruedForThePeriod),
          getFormattedMonetaryValue(feeRecord.facilityUtilisation),
          '-',
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when the reasons array contains one reason', () => {
      it('should return an array of the value of the fee record property that corresponds to the reason', () => {
        const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

        const result = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, reasons);

        const expected = [feeRecord.facilityId];

        expect(result).toEqual(expected);
      });
    });

    describe(`when the reasons array only contains ${RECORD_CORRECTION_REASON.OTHER}`, () => {
      it('should return an array with a string "-"', () => {
        const reasons = [RECORD_CORRECTION_REASON.OTHER];

        const result = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, reasons);

        const expected = ['-'];

        expect(result).toEqual(expected);
      });
    });
  });
});

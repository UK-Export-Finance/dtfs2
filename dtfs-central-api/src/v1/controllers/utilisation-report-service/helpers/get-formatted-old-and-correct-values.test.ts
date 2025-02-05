import { FeeRecordEntityMockBuilder, FeeRecordCorrectionEntityMockBuilder, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { getFormattedOldAndCorrectValues } from './get-formatted-old-and-correct-values';
import { mapCorrectionReasonsToFormattedOldFeeRecordValues } from '../../../../helpers/map-correction-reasons-to-formatted-old-fee-record-values';
import { mapCorrectionReasonsAndValuesToFormattedValues } from '../../../../helpers/map-correction-reasons-and-values-to-formatted-values';

describe('get-formatted-old-and-correct-values', () => {
  const feeRecordId = 11;

  describe('when a correction is not completed - isCompleted=false', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withDateRequested(new Date())
      .build();

    it('should return the joined result of mapCorrectionReasonsToFormattedOldFeeRecordValues for formattedOldRecords and a - for formattedCorrectRecords', () => {
      const result = getFormattedOldAndCorrectValues(correction, feeRecord);

      const oldRecords = mapCorrectionReasonsToFormattedOldFeeRecordValues(feeRecord, correction.reasons);

      const expected = {
        formattedOldRecords: oldRecords.join(', '),
        formattedCorrectRecords: '-',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when a correction is completed - isCompleted=true', () => {
    const feeRecord = new FeeRecordEntityMockBuilder().withId(feeRecordId).build();
    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, true)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withPreviousValues({
        facilityId: '11111111',
        feesPaidToUkefForThePeriod: 123.45,
      })
      .withCorrectedValues({
        facilityId: '22222222',
        feesPaidToUkefForThePeriod: 987.65,
      })
      .build();

    it('should return the joined result of mapCorrectionReasonsAndValuesToFormattedValues for both formattedOldRecords and formattedCorrectRecords', () => {
      const result = getFormattedOldAndCorrectValues(correction, feeRecord);

      const previousRecords = mapCorrectionReasonsAndValuesToFormattedValues(correction.reasons, correction.previousValues);

      const correctRecords = mapCorrectionReasonsAndValuesToFormattedValues(correction.reasons, correction.correctedValues);

      const expected = {
        formattedOldRecords: previousRecords.join(', '),
        formattedCorrectRecords: correctRecords.join(', '),
      };

      expect(result).toEqual(expected);
    });
  });
});

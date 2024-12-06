import { RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { mapReasonsToDisplayValues, mapReasonToDisplayValue } from './record-correction-reason-mapper';

describe('record-correction-reason-mapper', () => {
  describe('mapReasonToDisplayValue', () => {
    it.each`
      reason                                                  | expected
      ${RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT}       | ${'Facility ID is incorrect'}
      ${RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT} | ${'Reported currency is incorrect'}
      ${RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT}      | ${'Reported fee is incorrect'}
      ${RECORD_CORRECTION_REASON.UTILISATION_INCORRECT}       | ${'Utilisation is incorrect'}
      ${RECORD_CORRECTION_REASON.OTHER}                       | ${'Other'}
    `('should return $expected when reason is $reason', ({ reason, expected }: { reason: RecordCorrectionReason; expected: string }) => {
      // Act
      const result = mapReasonToDisplayValue(reason);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('mapReasonsToDisplayValues', () => {
    it('should return display values for the reasons', () => {
      // Arrange
      const reasons = [
        RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
        RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
        RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
        RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
        RECORD_CORRECTION_REASON.OTHER,
      ];

      // Act
      const result = mapReasonsToDisplayValues(reasons);

      // Assert
      expect(result).toEqual(['Facility ID is incorrect', 'Reported currency is incorrect', 'Reported fee is incorrect', 'Utilisation is incorrect', 'Other']);
    });
  });
});

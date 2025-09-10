import { FeeRecordEntityMockBuilder, FeeRecordCorrectionEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import {
  CURRENCY,
  FeeRecordCorrectionEntity,
  mapReasonToDisplayValue,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import { mapCompletedFeeRecordCorrectionsToResponse } from './map-completed-corrections-to-response';

console.error = jest.fn();

describe('get-completed-fee-record-corrections.controller map-completed-corrections-to-response helpers', () => {
  describe('mapCompletedFeeRecordCorrectionsToResponse', () => {
    it('should return an empty array if no completed corrections are provided', () => {
      // Arrange
      const completedCorrections: FeeRecordCorrectionEntity[] = [];

      // Act
      const response = mapCompletedFeeRecordCorrectionsToResponse(completedCorrections);

      // Assert
      expect(response).toEqual([]);
    });

    it('should map completed fee record corrections to response format', () => {
      // Arrange
      const exporter = 'An exporter';

      const feeRecordEntity = new FeeRecordEntityMockBuilder().withExporter(exporter).build();

      const correctionId = 123;
      const dateReceived = new Date();
      const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT, RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

      const previousValues = {
        feesPaidToUkefForThePeriod: 123.45,
        feesPaidToUkefForThePeriodCurrency: CURRENCY.USD,
      };

      const correctedValues = {
        feesPaidToUkefForThePeriod: 987.65,
        feesPaidToUkefForThePeriodCurrency: CURRENCY.EUR,
      };

      const bankCommentary = 'Some bank commentary';

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordEntity, true)
        .withId(correctionId)
        .withReasons(reasons)
        .withDateReceived(dateReceived)
        .withPreviousValues(previousValues)
        .withCorrectedValues(correctedValues)
        .withBankCommentary(bankCommentary)
        .build();

      const completedCorrections = [feeRecordCorrectionEntity];

      // Act
      const response = mapCompletedFeeRecordCorrectionsToResponse(completedCorrections);

      // Assert
      const expectedFormattedReasons = `${mapReasonToDisplayValue(reasons[0])}, ${mapReasonToDisplayValue(reasons[1])}`;
      const expectedFormattedPreviousValues = `${previousValues.feesPaidToUkefForThePeriod}, ${previousValues.feesPaidToUkefForThePeriodCurrency}`;
      const expectedFormattedCorrectedValues = `${correctedValues.feesPaidToUkefForThePeriod}, ${correctedValues.feesPaidToUkefForThePeriodCurrency}`;

      const expectedResponse = [
        {
          id: correctionId,
          dateSent: dateReceived,
          exporter,
          formattedReasons: expectedFormattedReasons,
          formattedPreviousValues: expectedFormattedPreviousValues,
          formattedCorrectedValues: expectedFormattedCorrectedValues,
          bankCommentary,
        },
      ];

      expect(response).toEqual(expectedResponse);
    });

    it('should set the mapped corrections "bankCommentary" attribute to undefined when a corrections bank commentary is null', () => {
      // Arrange
      const feeRecordEntity = new FeeRecordEntityMockBuilder().build();

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordEntity, true).withBankCommentary(null).build();

      const completedCorrections = [feeRecordCorrectionEntity];

      // Act
      const response = mapCompletedFeeRecordCorrectionsToResponse(completedCorrections);

      // Assert
      expect(response).toHaveLength(1);
      expect(response[0].bankCommentary).toBeUndefined();
    });

    it('should throw error when "dateReceived" is null', () => {
      // Arrange
      const feeRecordEntity = new FeeRecordEntityMockBuilder().build();

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecordEntity, true).withDateReceived(null).build();

      const completedCorrections = [feeRecordCorrectionEntity];

      // Act & Assert
      expect(() => mapCompletedFeeRecordCorrectionsToResponse(completedCorrections)).toThrow(
        'Invalid state: "dateReceived" is null but correction is marked as completed.',
      );
    });
  });
});

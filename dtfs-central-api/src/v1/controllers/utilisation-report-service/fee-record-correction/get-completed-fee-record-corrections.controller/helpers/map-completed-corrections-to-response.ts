import { FeeRecordCorrectionEntity, mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import { mapCorrectionReasonsAndValuesToFormattedValues } from './map-reasons-and-values-to-formatted-values';
import { GetCompletedFeeRecordCorrectionsResponseBody } from '..';

/**
 * Maps an array of completed fee record corrections to a response format.
 * @param completedCorrections - Array of fee record correction entities to be mapped
 * @returns Array of mapped fee record corrections containing formatted values
 * @throws Error if a completed correction has a null dateReceived value
 */
export const mapCompletedFeeRecordCorrectionsToResponse = (completedCorrections: FeeRecordCorrectionEntity[]): GetCompletedFeeRecordCorrectionsResponseBody =>
  completedCorrections.map((feeRecordCorrection) => {
    const { id, feeRecord, dateReceived: dateSent, reasons, previousValues, correctedValues, bankCommentary } = feeRecordCorrection;

    if (dateSent === null) {
      throw new Error('Invalid state: "dateReceived" is null but correction is marked as completed.');
    }

    const { exporter } = feeRecord;

    const formattedReasons = mapReasonsToDisplayValues(reasons).join(', ');

    const formattedPreviousValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, previousValues).join(', ');

    const formattedCorrectedValues = mapCorrectionReasonsAndValuesToFormattedValues(reasons, correctedValues).join(', ');

    return {
      id,
      dateSent,
      exporter,
      formattedReasons,
      formattedPreviousValues,
      formattedCorrectedValues,
      bankCommentary: bankCommentary ?? undefined,
    };
  });

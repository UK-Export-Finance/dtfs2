import { getFormattedCurrencyAndAmount, mapReasonsToDisplayValues, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { CorrectionRequestDetailsViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

/**
 * Maps the correction response to a correction request view model.
 * @param correctionResponse - The response body containing the correction details.
 * @returns The view model representing the correction request.
 */
export const mapToCorrectionRequestDetailsViewModel = (correctionResponse: GetFeeRecordCorrectionResponseBody): CorrectionRequestDetailsViewModel => {
  const errorTypeHeader = correctionResponse.reasons.length > 1 ? 'Error types' : 'Error type';

  return {
    facilityId: correctionResponse.facilityId,
    exporter: correctionResponse.exporter,
    formattedReportedFees: getFormattedCurrencyAndAmount(correctionResponse.reportedFees),
    reasons: correctionResponse.reasons,
    formattedReasons: mapReasonsToDisplayValues(correctionResponse.reasons).join(', '),
    additionalInfo: correctionResponse.additionalInfo,
    errorTypeHeader,
  };
};

/**
 * Type definition for labels used in the additional comments field.
 * Contains a label string and hint text string.
 */
type AdditionalCommentsFieldLabels = {
  label: string;
  hint: string;
};

/**
 * Labels for when the additional comments field is required.
 */
export const requiredAdditionalCommentsFieldLabels: AdditionalCommentsFieldLabels = {
  label: 'Record information',
  hint: 'Provide the correct information as indicated by UKEF',
};

/**
 * Labels for when the additional comments field is optional.
 */
export const optionalAdditionalCommentsFieldLabels: AdditionalCommentsFieldLabels = {
  label: 'Additional comments (optional)',
  hint: 'For example, if you are disputing the change, explain why below',
};

/**
 * Gets the labels for the additional comments field based on the correction reasons.
 * If there is only one reason and it is {@link{RECORD_CORRECTION_REASON.OTHER}},
 * returns labels for recording information.
 * Otherwise returns labels for optional additional comments.
 * @param correctionReasons The array of correction reasons
 * @returns The labels object containing label and hint text
 */
export const getAdditionalCommentsFieldLabels = (correctionReasons: RecordCorrectionReason[]): AdditionalCommentsFieldLabels => {
  if (correctionReasons.length === 0) {
    throw new Error('Correction must have at least one reason');
  }

  if (correctionReasons.length === 1 && correctionReasons[0] === RECORD_CORRECTION_REASON.OTHER) {
    return requiredAdditionalCommentsFieldLabels;
  }

  return optionalAdditionalCommentsFieldLabels;
};

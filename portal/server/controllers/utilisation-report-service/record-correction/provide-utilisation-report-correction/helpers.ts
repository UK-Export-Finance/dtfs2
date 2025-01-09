import {
  getFormattedCurrencyAndAmount,
  getFormattedMonetaryValue,
  mapReasonsToDisplayValues,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { GetFeeRecordCorrectionResponseBody, GetFeeRecordCorrectionTransientFormDataResponseBody } from '../../../../api-response-types';
import {
  CorrectionRequestDetailsViewModel,
  ProvideCorrectionFormValuesViewModel,
} from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';

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
export type AdditionalCommentsFieldLabels = {
  label: string;
  hint: string;
};

/**
 * Labels for the additional comments field when {@link RECORD_CORRECTION_REASON.OTHER}
 * is the only correction reason.
 */
export const requiredAdditionalCommentsFieldLabelsForSingleReason: AdditionalCommentsFieldLabels = {
  label: 'Record information',
  hint: 'Provide the correct information as indicated by UKEF',
};

/**
 * Labels for the additional comments field when there are many correction
 * reasons including {@link RECORD_CORRECTION_REASON.OTHER}.
 */
export const requiredAdditionalCommentsFieldLabelsForManyReasons: AdditionalCommentsFieldLabels = {
  label: 'Additional comments',
  hint: 'For example, if you are disputing the change, explain why below',
};

/**
 * Labels for the additional comments field when the correction reasons do not
 * include {@link RECORD_CORRECTION_REASON.OTHER}.
 */
export const optionalAdditionalCommentsFieldLabels: AdditionalCommentsFieldLabels = {
  label: 'Additional comments (optional)',
  hint: 'For example, if you are disputing the change, explain why below',
};

/**
 * Gets the labels for the additional comments field based on the correction reasons.
 * @param correctionReasons The array of correction reasons
 * @returns The additional comments labels, dependent on the correction reasons.
 */
export const getAdditionalCommentsFieldLabels = (correctionReasons: RecordCorrectionReason[]): AdditionalCommentsFieldLabels => {
  if (correctionReasons.length === 0) {
    throw new Error('Corrections must have at least one reason');
  }

  const hasOtherReason = correctionReasons.includes(RECORD_CORRECTION_REASON.OTHER);

  if (!hasOtherReason) {
    return optionalAdditionalCommentsFieldLabels;
  }

  if (correctionReasons.length === 1) {
    return requiredAdditionalCommentsFieldLabelsForSingleReason;
  }

  return requiredAdditionalCommentsFieldLabelsForManyReasons;
};

/**
 * Maps the saved form values to the form values view model.
 * @param savedFormValues - The saved transient form values
 * @returns The view model for the saved form values
 */
export const mapToProvideCorrectionFormValuesViewModel = (
  savedFormValues: GetFeeRecordCorrectionTransientFormDataResponseBody,
): ProvideCorrectionFormValuesViewModel => ({
  facilityId: savedFormValues.facilityId ?? null,
  utilisation: savedFormValues.utilisation ? getFormattedMonetaryValue(savedFormValues.utilisation) : null,
  reportedFee: savedFormValues.reportedFee ? getFormattedMonetaryValue(savedFormValues.reportedFee) : null,
  additionalComments: savedFormValues.additionalComments ?? null,
});

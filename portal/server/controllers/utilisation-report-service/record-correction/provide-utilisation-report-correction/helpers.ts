import {
  getFormattedCurrencyAndAmount,
  getFormattedMonetaryValue,
  mapReasonsToDisplayValues,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValues,
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
 * Maps an input value to a formatted monetary value or returns the original value.
 *
 * If the value is undefined, returns null.
 * If the value is a number, it will be formatted as a string with two decimal
 * places and thousands separators.
 * If the value is a string, returns the original string.
 * @param inputValue - The input value to format
 * @returns Formatted monetary value string, null if undefined, or original string if invalid
 */
export const mapInputValueToFormattedMonetaryValueOrOriginal = (inputValue?: string | number): string | null => {
  if (inputValue === undefined) {
    return null;
  }

  if (typeof inputValue === 'number') {
    return getFormattedMonetaryValue(inputValue);
  }

  return inputValue;
};

/**
 * Maps the form values to the form values view model.
 * @param formValues - The form values
 * @returns The view model for the saved form values
 */
export const mapToProvideCorrectionFormValuesViewModel = (
  formValues: GetFeeRecordCorrectionTransientFormDataResponseBody | RecordCorrectionFormValues,
): ProvideCorrectionFormValuesViewModel => {
  const utilisation = mapInputValueToFormattedMonetaryValueOrOriginal(formValues.utilisation);

  const reportedFee = mapInputValueToFormattedMonetaryValueOrOriginal(formValues.reportedFee);

  return {
    utilisation,
    reportedFee,
    facilityId: formValues.facilityId ?? null,
    additionalComments: formValues.additionalComments ?? null,
  };
};

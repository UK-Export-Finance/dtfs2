import { RecordCorrectionReason, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { getFormattedFormDataValueForCorrectionReason } from './format-form-data-value-for-reason';

/**
 * Maps through an array of correction reasons and returns an array of
 * formatted values from the transient form data.
 * @param formData - The transient form data containing corrected values
 * @param reasons - Array of reasons for the correction
 * @returns Array of formatted values from the form data, corresponding to each correction reason
 */
export const mapFormDataToFormattedValues = (formData: RecordCorrectionTransientFormData, reasons: RecordCorrectionReason[]) => {
  return reasons.map((reason) => getFormattedFormDataValueForCorrectionReason(formData, reason));
};

import { getMonetaryValueAsNumber, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { ValidatedRecordCorrectionTransientFormData } from '../../../../../../types/validated-record-correction-form-values';

/**
 * Parses validated record correction transient form values.
 * @param formValues - The validated form data containing record correction values.
 * @returns A RecordCorrectionTransientFormData object with parsed monetary values and form fields.
 */
export const parseValidatedRecordCorrectionTransientFormValues = (
  formValues: ValidatedRecordCorrectionTransientFormData,
): RecordCorrectionTransientFormData => ({
  utilisation: formValues.utilisation ? getMonetaryValueAsNumber(formValues.utilisation) : undefined,
  reportedCurrency: formValues.reportedCurrency,
  reportedFee: formValues.reportedFee ? getMonetaryValueAsNumber(formValues.reportedFee) : undefined,
  facilityId: formValues.facilityId,
  additionalComments: formValues.additionalComments,
});

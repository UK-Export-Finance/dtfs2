import { getMonetaryValueAsNumber, isCurrencyValid, RecordCorrectionFormValues, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';

/**
 * Parses validated record correction transient form values.
 * @param formValues - The validated form data containing record correction values.
 * @returns A RecordCorrectionTransientFormData object with parsed monetary values and form fields.
 */
export const parseValidatedRecordCorrectionTransientFormValues = (formValues: RecordCorrectionFormValues): RecordCorrectionTransientFormData => ({
  utilisation: formValues.utilisation ? getMonetaryValueAsNumber(formValues.utilisation) : undefined,
  reportedCurrency: isCurrencyValid(formValues.reportedCurrency) ? formValues.reportedCurrency : undefined,
  reportedFee: formValues.reportedFee ? getMonetaryValueAsNumber(formValues.reportedFee) : undefined,
  facilityId: formValues.facilityId,
  additionalComments: formValues.additionalComments,
});

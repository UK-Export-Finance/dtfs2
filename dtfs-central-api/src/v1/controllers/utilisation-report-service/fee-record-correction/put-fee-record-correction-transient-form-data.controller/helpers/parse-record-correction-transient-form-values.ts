import { getMonetaryValueAsNumber, isCurrencyValid, RecordCorrectionFormValues, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';

/**
 * Parses validated record correction transient form values.
 * @param formValues - The validated form data containing record correction values.
 * @returns A RecordCorrectionTransientFormData object with parsed monetary values and form fields.
 */
export const parseValidatedRecordCorrectionTransientFormValues = (formValues: RecordCorrectionFormValues): RecordCorrectionTransientFormData => {
  // TODO: Check if we can update each of the items below to go to null instead of undefined.

  const utilisation = formValues.utilisation ? getMonetaryValueAsNumber(formValues.utilisation) : undefined;

  const reportedCurrency = isCurrencyValid(formValues.reportedCurrency) ? formValues.reportedCurrency : undefined;

  const reportedFee = formValues.reportedFee ? getMonetaryValueAsNumber(formValues.reportedFee) : undefined;

  const additionalComments = formValues.additionalComments?.trim() || null;

  const { facilityId } = formValues;

  return {
    utilisation,
    reportedCurrency,
    reportedFee,
    facilityId,
    additionalComments,
  };
};

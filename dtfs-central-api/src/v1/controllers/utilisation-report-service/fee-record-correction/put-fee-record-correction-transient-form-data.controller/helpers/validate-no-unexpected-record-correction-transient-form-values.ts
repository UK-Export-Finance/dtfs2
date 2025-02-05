import { RecordCorrectionFormValues, RecordCorrectionReason, InvalidPayloadError } from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getFormKeyForReason } from './extract-record-correction-transient-form-values';

/**
 * Array of form field keys that can be validated against correction reasons.
 *
 * Note that the "additionalComments" field is excluded as it can be provided
 * regardless of the correction reasons.
 */
const formFieldKeysWithoutAdditionalComments: (keyof RecordCorrectionFormValues)[] = ['utilisation', 'facilityId', 'reportedCurrency', 'reportedFee'];

/**
 * Validates that there are no form values provided for reasons that are not
 * in the correction request.
 *
 * Note that the "additionalComments" field is excluded as it can be provided
 * regardless of the correction reasons.
 * @param formValues - The form values to validate.
 * @param reasons - The reasons for the record correction that determine which form values are expected.
 * @throws InvalidPayloadError if there are any form values provided for reasons not in the correction request.
 */
export const validateNoUnexpectedFormValues = (formValues: RecordCorrectionFormValues, reasons: RecordCorrectionReason[]) => {
  const requiredFormFieldKeys = reasons.map((reason) => getFormKeyForReason(reason));
  const unexpectedFormFieldKeys = difference(formFieldKeysWithoutAdditionalComments, requiredFormFieldKeys);

  unexpectedFormFieldKeys.forEach((formFieldKey) => {
    const formFieldValue = formValues[formFieldKey];

    if (formFieldValue) {
      throw new InvalidPayloadError(
        `Expected form field "${formFieldKey}" to be undefined as it does not have an associated reason in the correction request.`,
      );
    }
  });
};

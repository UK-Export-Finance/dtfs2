import { isNonEmptyString, RECORD_CORRECTION_REQUEST_REASON, RecordCorrectionRequestReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues } from '../../../../types/view-models';

/**
 * Values for the record correction request reasons as a string array.
 */
const RECORD_CORRECTION_REQUEST_REASON_VALUES = Object.values(RECORD_CORRECTION_REQUEST_REASON) as string[];

export type CreateRecordCorrectionRequestFormRequestBody = {
  reasons?: string | string[];
  additionalInfo?: string;
};

/**
 * Checks if the provided reason is a valid RecordCorrectionRequestReason.
 * @param reason - The reason to validate.
 * @returns True if the reason is valid, otherwise false.
 */
export function isRecordCorrectionRequestReason(reason: string): reason is RecordCorrectionRequestReason {
  return isNonEmptyString(reason) && RECORD_CORRECTION_REQUEST_REASON_VALUES.includes(reason);
}

/**
 * Retrieves valid record correction request reasons from the provided input.
 * @param reasons - The reasons to validate. Can be a single reason as a string or an array of reasons.
 * @returns An array of valid record correction request reasons. If no valid reasons are found, returns an empty array.
 */
export const extractRecordCorrectionRequestReasons = (reasons?: string | string[]): RecordCorrectionRequestReason[] => {
  if (!reasons) {
    return [];
  }

  if (Array.isArray(reasons)) {
    return reasons.filter((reason) => isRecordCorrectionRequestReason(reason));
  }

  return isRecordCorrectionRequestReason(reasons) ? [reasons] : [];
};

/**
 * Extracts form values from the request body for creating a record correction request.
 * @param requestBody - The request body containing form data.
 * @returns Object containing the extracted form values.
 */
export const extractCreateRecordCorrectionRequestFormValues = (
  requestBody: CreateRecordCorrectionRequestFormRequestBody,
): CreateRecordCorrectionRequestFormValues => ({
  reasons: extractRecordCorrectionRequestReasons(requestBody.reasons),
  additionalInfo: requestBody.additionalInfo,
});

import { isNonEmptyString, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestFormValues } from '../../../../types/view-models';

/**
 * Values for the record correction reasons as a string array.
 */
const RECORD_CORRECTION_REASON_VALUES = Object.values(RECORD_CORRECTION_REASON) as string[];

export type CreateRecordCorrectionRequestFormRequestBody = {
  reasons?: string | string[];
  additionalInfo?: string;
};

/**
 * Checks if the provided reason is a valid RecordCorrectionRequestReason.
 * @param reason - The reason to validate.
 * @returns True if the reason is valid, otherwise false.
 */
export function isRecordCorrectionReason(reason: string): reason is RecordCorrectionReason {
  return isNonEmptyString(reason) && RECORD_CORRECTION_REASON_VALUES.includes(reason);
}

/**
 * Retrieves valid record correction reasons from the provided input.
 * @param reasons - The reasons to validate. Can be a single reason as a string or an array of reasons.
 * @returns An array of valid record correction reasons. If no valid reasons are found, returns an empty array.
 */
export const extractRecordCorrectionReasons = (reasons?: string | string[]): RecordCorrectionReason[] => {
  if (!reasons) {
    return [];
  }

  if (Array.isArray(reasons)) {
    return reasons.filter((reason) => isRecordCorrectionReason(reason));
  }

  return isRecordCorrectionReason(reasons) ? [reasons] : [];
};

/**
 * Extracts form values from the request body for creating a record correction request.
 * @param requestBody - The request body containing form data.
 * @returns Object containing the extracted form values.
 */
export const extractCreateRecordCorrectionRequestFormValues = (
  requestBody: CreateRecordCorrectionRequestFormRequestBody,
): CreateRecordCorrectionRequestFormValues => ({
  reasons: extractRecordCorrectionReasons(requestBody.reasons),
  additionalInfo: requestBody.additionalInfo,
});

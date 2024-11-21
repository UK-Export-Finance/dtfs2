import { RECORD_CORRECTION_REQUEST_REASON, RecordCorrectionRequestReason } from '@ukef/dtfs2-common';
import { RecordCorrectionRequestReasonCheckboxId } from '../../../../types/record-correction-request-reason-checkbox-id';
import { CreateRecordCorrectionRequestFormValues } from '../../../../types/view-models';

export type CreateRecordCorrectionRequestFormRequestBody = {
  reasons?: string | string[];
  additionalInfo?: string;
};

// TODO FN-3575: Can we remove all of this ID stuff and just keep the RECORD_CORRECTION_REQUEST_REASON type given the way this is passed through in the body

/**
 * Regular expression group to match a record correction reason from a checkbox id.
 */
const RECORD_CORRECTION_REASON_CHECKBOX_ID_REGEX_GROUP = `reasons-(?<reason>${Object.values(RECORD_CORRECTION_REQUEST_REASON).join('|')})`;
const RECORD_CORRECTION_REASON_CHECKBOX_ID_REGEX = new RegExp(RECORD_CORRECTION_REASON_CHECKBOX_ID_REGEX_GROUP);

/**
 * Filters object keys to find checkbox IDs that match the record correction reason pattern.
 * @param object - The object whose keys should be filtered.
 * @returns Array of record correction request reason checkbox IDs.
 */
export const getRecordCorrectionReasonCheckboxIdsFromObjectKeys = (object: object): RecordCorrectionRequestReasonCheckboxId[] =>
  Object.keys(object).filter((key) => RECORD_CORRECTION_REASON_CHECKBOX_ID_REGEX.test(key)) as RecordCorrectionRequestReasonCheckboxId[];

/**
 * Extracts the reason from each record correction request reason checkbox ID in the provided array.
 * @param checkboxIds - Array of checkbox IDs to process.
 * @returns Array of record correction request reasons extracted from the checkbox IDs.
 */
export const getReasonFromRecordCorrectionReasonCheckboxIds = (checkboxIds: RecordCorrectionRequestReasonCheckboxId[]): RecordCorrectionRequestReason[] =>
  checkboxIds.map((checkboxId) => {
    const { reason } = RECORD_CORRECTION_REASON_CHECKBOX_ID_REGEX.exec(checkboxId)!.groups!;
    return reason as RecordCorrectionRequestReason;
  });

/**
 * Extracts form values from the request body for creating a record correction request.
 * @param requestBody - The request body containing form data.
 * @returns Object containing the extracted form values.
 */
export const extractCreateRecordCorrectionRequestFormValues = (
  requestBody: CreateRecordCorrectionRequestFormRequestBody,
): CreateRecordCorrectionRequestFormValues => ({
  reasons: requestBody.reasons, // TODO: Improve? Convert into nicer type?
  additionalInfo: requestBody.additionalInfo,
});

// TODO FN-3575: Do we need a parse function to convert the reasons into a typed array?

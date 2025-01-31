import { RecordCorrectionReason } from '@ukef/dtfs2-common';

/**
 * Validates that a required fee record correction field has a value.
 * Zero (0) is considered a valid value and will not throw an error.
 * @param value - The value to validate
 * @param reason - The correction reason associated with the field
 * @throws Error if the value is undefined or null
 */
export function validateRequiredCorrectionField<T>(value: T | undefined | null, reason: RecordCorrectionReason): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`Required field is missing value for correction reason: ${reason}`);
  }
}

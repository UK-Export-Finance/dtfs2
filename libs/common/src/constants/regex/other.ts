/**
 * Named capture group pattern matching one or more comma-separated numeric IDs.
 * Intended to be embedded within other regex patterns.
 *
 * Examples:
 * - `1` (single ID)
 * - `1,2,3` (multiple comma-separated IDs)
 *
 * Does not match:
 * - `1, 2` (space after comma is not matched by the digit/comma group)
 */
export const COMMA_SEPARATED_IDS_REGEX_GROUP = `(?<commaSeparatedIds>(\\d+,?)+)`;

/**
 * Compiled regex from {@link COMMA_SEPARATED_IDS_REGEX_GROUP}.
 *
 * Examples:
 * - `1,2,3` (captured in the `commaSeparatedIds` group)
 *
 * Does not match:
 * - `` (empty string, requires at least one digit)
 */
export const COMMA_SEPARATED_IDS_REGEX = new RegExp(COMMA_SEPARATED_IDS_REGEX_GROUP);

/**
 * Factory function that builds a regex matching one of the given status values
 * immediately preceded by `status-` and anchored to the end of the string.
 * The surrounding `status-` prefix and end anchor prevent a longer status (e.g.
 * `TO_DO_AMENDED`) from being incorrectly matched as a shorter one (e.g. `TO_DO`).
 *
 * Examples:
 * - `createFeeRecordStatusRegex(['TO_DO', 'DONE'])` matches `...-status-TO_DO`
 *
 * Does not match:
 * - `...-status-TO_DO_AMENDED` when only `TO_DO` is a valid status value
 *
 * @param statusValues - The status values to match (e.g. `Object.values(FEE_RECORD_STATUS)`)
 * @returns A regex with a named `status` capture group
 */
export const createFeeRecordStatusRegex = (statusValues: string[]): RegExp => {
  const statusGroup = `(?<status>${statusValues.join('|')})`;
  return new RegExp(`status-${statusGroup}$`);
};

/**
 * Matches an edit payments table checkbox ID and captures the fee record ID.
 *
 * Examples:
 * - `feeRecordId-123` (captures `id` as `123`)
 *
 * Does not match:
 * - `feeRecordId-` (no digits present)
 */
export const EDIT_PAYMENTS_TABLE_CHECKBOX_ID_REGEX = /feeRecordId-(?<id>\d+)/;

/**
 * Matches a `premiumPaymentsFacilityId` query parameter and captures its value.
 * The value must be between 4 and 10 digits long.
 *
 * Examples:
 * - `premiumPaymentsFacilityId=1234567890` (captures `premiumPaymentsFacilityId` as `1234567890`)
 *
 * Does not match:
 * - `premiumPaymentsFacilityId=123` (fewer than 4 digits)
 */
export const PREMIUM_PAYMENTS_FACILITY_ID_QUERY_REGEX = /premiumPaymentsFacilityId=(?<premiumPaymentsFacilityId>\d{4,10})/;

/**
 * Factory function that builds a regex matching a keying sheet row checkbox ID,
 * capturing the fee record ID and status.
 *
 * Examples:
 * - `createKeyingSheetRowCheckboxIdRegex(['TO_DO', 'DONE'])` matches
 *   `feeRecordId-123-status-TO_DO` (captures `id` as `123` and `status` as `TO_DO`)
 *
 * Does not match:
 * - `feeRecordId-123-status-UNKNOWN` when `UNKNOWN` is not in `statusValues`
 *
 * @param statusValues - The status values to match (e.g. `Object.values(KEYING_SHEET_ROW_STATUS)`)
 * @returns A regex with named `id` and `status` capture groups
 */
export const createKeyingSheetRowCheckboxIdRegex = (statusValues: string[]): RegExp => {
  const statusGroup = `(?<status>${statusValues.join('|')})`;
  return new RegExp(`feeRecordId-(?<id>\\d+,?)-status-${statusGroup}`);
};

/**
 * Factory function that builds a regex matching a premium payments table checkbox ID,
 * combining comma-separated IDs, a currency, and a fee record status into a single pattern.
 *
 * Examples:
 * - `createPremiumPaymentsTableCheckboxIdRegex(COMMA_SEPARATED_IDS_REGEX_GROUP, CURRENCY_REGEX_GROUP, '(?<status>TO_DO|DONE)')`
 *   matches `feeRecordIds-1,2-reportedPaymentsCurrency-GBP-status-TO_DO`
 *
 * Does not match:
 * - A string missing any of the `feeRecordIds-`, `-reportedPaymentsCurrency-`, or `-status-` segments
 *
 * @param commaSeparatedIdsGroup - Regex group matching comma-separated fee record IDs
 * @param currencyRegexGroup - Regex group matching a currency code
 * @param feeRecordStatusGroup - Regex group matching a fee record status
 * @returns A regex combining all three groups into the full checkbox ID pattern
 */
export const createPremiumPaymentsTableCheckboxIdRegex = (commaSeparatedIdsGroup: string, currencyRegexGroup: string, feeRecordStatusGroup: string): RegExp =>
  new RegExp(`feeRecordIds-${commaSeparatedIdsGroup}-reportedPaymentsCurrency-${currencyRegexGroup}-status-${feeRecordStatusGroup}$`);

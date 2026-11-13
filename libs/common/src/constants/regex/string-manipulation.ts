/**
 * Matches any character that is not alphanumeric, a hyphen, or an underscore.
 * Used to strip newlines, punctuation, and other special characters from a string.
 *
 * Examples:
 * - `abc 123!` → `abc123` (removes space and punctuation)
 * - `abc-123_def` → `abc-123_def` (hyphens and underscores are preserved)
 *
 * Does not match:
 * - Letters, digits, hyphens, or underscores
 */
export const NEW_LINE_AND_PUNCTUATION_REGEX = /[^a-zA-Z0-9_-]/g;

/**
 * Matches every ampersand (`&`) character in a string.
 * Used to replace ampersands with a word such as "and".
 *
 * Examples:
 * - `A&B` → `AandB` (replacing `&` with `and`)
 *
 * Does not match:
 * - `AandB` (no ampersand present)
 */
export const AMPERSAND_REGEX = /&/g;

/**
 * Matches every comma (`,`) character in a string.
 * Used to strip thousands separators from numeric strings before parsing.
 *
 * Examples:
 * - `1,234` → `1234` (removing the thousands separator)
 *
 * Does not match:
 * - `1234` (no comma present)
 */
export const COMMA_SEPARATOR_REGEX = /,/g;

/**
 * Matches every carriage return + line feed (`\r\n`) sequence in a string.
 * Used to normalise Windows-style line endings to Unix-style line endings.
 *
 * Examples:
 * - `line1\r\nline2` → `line1\nline2` (normalising to `\n`)
 *
 * Does not match:
 * - `line1\nline2` (already uses `\n` only)
 */
export const CRLF_TO_LF_REGEX = /\r\n/g;

/**
 * Matches SharePoint/Windows reserved filenames and patterns.
 * Covers `_vti_*` prefixes, `.lock` files, and Windows reserved device names
 * (`CON`, `PRN`, `AUX`, `NUL`, `COM0`-`COM9`, `LPT0`-`LPT9`), plus `desktop.ini`.
 * Reference: https://support.microsoft.com/en-us/office/restrictions-and-limitations-in-onedrive-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa
 *
 * Examples:
 * - `_vti_bin` → `` (matches the `_vti_` prefix)
 * - `CON` → `` (matches the reserved device name)
 *
 * Does not match:
 * - `report.docx` (not a reserved name)
 */
export const SHAREPOINT_RESERVED_NAMES_REGEX = /(^_vti_.*|\.lock|CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9]|desktop\.ini)/gi;

/**
 * Matches one or more consecutive characters that are not alphanumeric.
 * Used to replace runs of special characters with a single replacement character.
 *
 * Examples:
 * - `abc@123#def` → `abc-123-def` (replacing special characters with `-`)
 *
 * Does not match:
 * - `abc123def` (no special characters present)
 */
export const NON_ALPHANUMERIC_REGEX = /[^a-zA-Z0-9]+/g;

/**
 * Matches Unicode combining diacritical marks (U+0300 to U+036F).
 * Used after `String.prototype.normalize('NFD')` to strip accents from characters.
 *
 * Examples:
 * - `café`.normalize('NFD') → `cafe` (accent removed after NFD normalisation)
 *
 * Does not match:
 * - Base Latin characters without combining marks
 */
export const ACCENTED_CHARACTERS_REGEX = /[\u0300-\u036f]/g;

/**
 * Matches every percentage sign (`%`) character in a string.
 *
 * Examples:
 * - `100%` → `100` (removing the percentage sign)
 *
 * Does not match:
 * - `100` (no percentage sign present)
 */
export const PERCENTAGE_SIGN_REGEX = /%/g;

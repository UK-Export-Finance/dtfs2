/**
 * Centralized regex pattern constants for GIFT application.
 * All regex patterns are collected here for maintainability and reusability.
 * Each pattern includes JSDoc documentation with examples of matching and non-matching strings.
 * Patterns are organized into logical modules for better organization.
 *
 * Usage: import { REGEX } from '@ukef/gift-common/constants'
 * Access patterns via: REGEX.ALPHANUMERIC, REGEX.DIGITS_LENGTH(), etc.
 */

import * as date from './date';
import * as htmlUrl from './html-url';
import * as other from './other';
import * as stringManipulation from './string-manipulation';
import * as stringValidation from './string-validation';

/**
 * Centralised regex pattern constants.
 * All regex patterns are collected here for maintainability and reusability.
 * Each pattern includes JSDoc documentation with examples of matching and non-matching strings.
 * Patterns are organised into logical modules (see the sibling files in this directory) for
 * better organisation, then combined into this single `REGEX` namespace.
 *
 * Usage: `import { REGEX } from '@ukef/dtfs2-common';`
 * Access patterns via: `REGEX.ISO_MONTH_REGEX`, `REGEX.createFeeRecordStatusRegex(...)`, etc.
 */
export const REGEX = {
  ...date,
  ...htmlUrl,
  ...other,
  ...stringManipulation,
  ...stringValidation,
};

import { WithArrayTestsOptions } from '../primitive-types-tests';
import { TestCaseWithType } from '../types/test-case-with-type.type';

export type TestCase =
  | TestCaseWithType<'string'>
  | TestCaseWithType<'number'>
  | TestCaseWithType<'boolean'>
  | TestCaseWithType<'Array', WithArrayTestsOptions>
  | TestCaseWithType<'TfmTeamSchema'>
  | TestCaseWithType<'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SCHEMA'>
  | TestCaseWithType<'ISO_DATE_TIME_STAMP_SCHEMA'>
  | TestCaseWithType<'ENTRA_ID_USER_SCHEMA'>
  | TestCaseWithType<'CURRENCY_SCHEMA'>
  | TestCaseWithType<'ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA'>
  | TestCaseWithType<'UPSERT_TFM_USER_REQUEST_SCHEMA'>;

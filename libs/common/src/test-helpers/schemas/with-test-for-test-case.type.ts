import { DefaultOptions, WithArrayTestsOptions } from './primitive-object-tests';

/**
 * All test case types that have been tests implemented
 */
export type TestCaseTypes =
  | 'string'
  | 'number'
  | 'boolean'
  | 'Array'
  | 'TfmTeamSchema'
  | 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA'
  | 'UNIX_TIMESTAMP_SECONDS_SCHEMA'
  | 'UNIX_TIMESTAMP_SCHEMA'
  | 'OBJECT_ID_SCHEMA'
  | 'OBJECT_ID_STRING_SCHEMA'
  | 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'
  | 'ISO_DATE_TIME_STAMP_SCHEMA'
  | 'AUDIT_DATABASE_RECORD_SCHEMA'
  | 'ENTRA_ID_USER_SCHEMA';

/**
 * The test case to be tested, including the type and any options that are required
 *
 * Allows for the passing in of additional options if required for the specific test case
 */
type TestCaseWithType<Type extends TestCaseTypes, AdditionalOptions = false> = {
  type: Type;
} & (AdditionalOptions extends false ? { options?: Partial<DefaultOptions> } : { options: AdditionalOptions & Partial<DefaultOptions> });

export type TestCase =
  | TestCaseWithType<'string'>
  | TestCaseWithType<'number'>
  | TestCaseWithType<'boolean'>
  | TestCaseWithType<'Array', WithArrayTestsOptions>
  | TestCaseWithType<'TfmTeamSchema'>
  | TestCaseWithType<'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SECONDS_SCHEMA'>
  | TestCaseWithType<'UNIX_TIMESTAMP_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'ISO_DATE_TIME_STAMP_SCHEMA'>
  | TestCaseWithType<'AUDIT_DATABASE_RECORD_SCHEMA'>
  | TestCaseWithType<'ENTRA_ID_USER_SCHEMA'>;

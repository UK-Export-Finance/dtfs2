import { DefaultOptions } from '../schemas/primitive-types-tests';

/**
 * All test case types that have been tests implemented
 */
export type TestCaseTypes = 'OBJECT_ID_SCHEMA' | 'OBJECT_ID_STRING_SCHEMA' | 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA' | 'AUDIT_DATABASE_RECORD_SCHEMA';

/**
 * The test case to be tested, including the type and any options that are required
 *
 * Allows for the passing in of additional options if required for the specific test case
 */
type TestCaseWithType<Type extends TestCaseTypes, AdditionalOptions = false> = {
  type: Type;
} & (AdditionalOptions extends false ? { options?: Partial<DefaultOptions> } : { options: AdditionalOptions & Partial<DefaultOptions> });

export type TestCase =
  | TestCaseWithType<'OBJECT_ID_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA'>
  | TestCaseWithType<'AUDIT_DATABASE_RECORD_SCHEMA'>;

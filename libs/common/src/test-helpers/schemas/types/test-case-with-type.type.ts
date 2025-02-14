import { DefaultOptions } from '../primitive-types-tests';

/**
 * The test case to be tested, including the type and any options that are required
 *
 * Allows for the passing in of additional options if required for the specific test case
 */
export type TestCaseWithType<Type extends string, AdditionalOptions = false> = {
  type: Type;
} & (AdditionalOptions extends false ? { options?: Partial<DefaultOptions> } : { options: AdditionalOptions & Partial<DefaultOptions> });

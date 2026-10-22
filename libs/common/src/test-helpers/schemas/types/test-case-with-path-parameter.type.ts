import { TestCase } from '@ukef/test-helpers/schemas/test-cases';

/**
 * Test cases with the path parameter, used to create the getTestObjectWithUpdatedParameter function
 */
export type TestCaseWithPathParameter = {
  parameterPath: string;
} & TestCase;

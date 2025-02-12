import { TestCase } from '../test-cases/test-case';

/**
 * Test cases with the path parameter, used to create the getTestObjectWithUpdatedParameter function
 */
export type TestCaseWithPathParameter<T extends TestCase> = {
  parameterPath: string;
} & T;

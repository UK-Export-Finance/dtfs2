import { BaseTestCase } from '../test-cases/base-test-case';

/**
 * Test cases with the path parameter, used to create the getTestObjectWithUpdatedParameter function
 */
export type TestCaseWithPathParameter<T extends BaseTestCase> = {
  parameterPath: string;
} & T;

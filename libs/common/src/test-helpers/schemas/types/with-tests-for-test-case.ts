import { TestCase } from '../test-cases';

export type WithTestsForTestCaseProps<Schema> = {
  schema: Schema;
  testCase: TestCase;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
  getUpdatedParameterFromParsedTestObject: (parsedTestObject: unknown) => unknown;
};

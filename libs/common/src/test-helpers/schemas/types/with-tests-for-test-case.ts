export type WithTestsForTestCaseProps<Schema, TestCase> = {
  schema: Schema;
  testCase: TestCase;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
  getUpdatedParameterFromParsedTestObject: (parsedTestObject: unknown) => unknown;
};

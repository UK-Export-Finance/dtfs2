export type WithTestsForTestCaseProps<Schema, T> = {
  schema: Schema;
  testCase: T;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
  getUpdatedParameterFromParsedTestObject: (parsedTestObject: unknown) => unknown;
};

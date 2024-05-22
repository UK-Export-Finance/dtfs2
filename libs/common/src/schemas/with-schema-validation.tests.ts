type TestCase = { testCase: unknown; description: string };

export const withSchemaValidationTests = ({
  successTestCases,
  failureTestCases,
  schema,
  schemaName,
}: {
  successTestCases: Array<TestCase>;
  failureTestCases: Array<TestCase>;
  schema: Zod.Schema;
  schemaName: string;
}) => {
  describe('when validating a valid input', () => {
    it.each(successTestCases)(`should validate $description as a valid ${schemaName}`, ({ testCase }) => {
      expect(schema.safeParse(testCase).success).toBe(true);
    });
  });
  describe('when validating an invalid input', () => {
    it.each(failureTestCases)(`should not validate $description as a valid ${schemaName}`, ({ testCase }) => {
      expect(schema.safeParse(testCase).success).toBe(false);
    });
  });
};

import { ZodSchema } from 'zod';

type SchemaTestCases = { aTestCase: () => any; description: string }[];

/**
 * This is a reusable test to allow for complete testing of zod schemas
 * It can be used on it's own, or built into further test helpers
 */
export const withSchemaTests = ({
  schema,
  failureTestCases,
  successTestCases,
}: {
  schema: ZodSchema;
  failureTestCases: SchemaTestCases;
  successTestCases: SchemaTestCases;
}) => {
  it.each(failureTestCases)('should fail parsing if $description', ({ aTestCase }) => {
    const { success } = schema.safeParse(aTestCase());
    expect(success).toBe(false);
  });

  it.each(successTestCases)('should pass parsing if $description', ({ aTestCase }) => {
    const { success } = schema.safeParse(aTestCase());
    expect(success).toBe(true);
  });
};

import { ZodObject } from 'zod';

type SchemaTestCases = { aTestCase: () => any; description: string }[];

export const withSchemaTests = ({
  schema,
  failureTestCases,
  successTestCases,
}: {
  schema: ZodObject<any>;
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

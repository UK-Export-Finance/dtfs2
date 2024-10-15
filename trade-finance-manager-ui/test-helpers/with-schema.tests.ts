import { ZodSchema } from 'zod';

type SchemaTestCases = { aTestCase: () => any; description: string }[];

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
    expect(success).toEqual(false);
  });

  it.each(successTestCases)('should pass parsing if $description', ({ aTestCase }) => {
    const { success } = schema.safeParse(aTestCase());
    expect(success).toEqual(true);
  });
};

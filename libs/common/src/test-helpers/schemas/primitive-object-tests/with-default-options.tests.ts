import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';

/**
 * A list of default options
 *
 * Theses options are used to determine the behavior of the schema, and run the default tests accordingly
 *
 * Also includes the ability to override how the test object is created, which is useful when creating schema tests.
 */
export type DefaultOptions = {
  overrideGetTestObjectWithUpdatedField?: (newValue: unknown) => unknown;
  isOptional?: boolean;
  isNullable?: boolean;
};

export const withDefaultOptionsTests = <Schema extends ZodSchema>({
  schema,
  getTestObjectWithUpdatedField,
  options = {},
}: WithSchemaTestParams<Schema, DefaultOptions>) => {
  const defaultOptions: DefaultOptions = {
    ...{
      isOptional: false,
      isNullable: false,
    },
    ...options,
  };
  if (defaultOptions.isOptional) {
    withIsOptionalTests();
  } else {
    withIsRequiredTests();
  }

  if (defaultOptions.isNullable) {
    withIsNullableTrueTests();
  } else {
    withIsNullableFalseTests();
  }

  function withIsOptionalTests() {
    it('should pass parsing if the parameter is missing', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(undefined));
      expect(success).toBe(true);
    });
  }

  function withIsRequiredTests() {
    it('should fail parsing if the parameter is missing', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(undefined));
      expect(success).toBe(false);
    });
  }

  function withIsNullableTrueTests() {
    it('should pass parsing if the parameter is null', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(null));
      expect(success).toBe(true);
    });
  }

  function withIsNullableFalseTests() {
    it('should fail parsing if the parameter is null', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(null));
      expect(success).toBe(false);
    });
  }
};

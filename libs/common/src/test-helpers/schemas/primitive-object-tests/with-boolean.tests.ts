import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withBooleanTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedField }: WithSchemaTestParams<Schema>) => {
  describe('with boolean tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('true'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(true));
      expect(success).toBe(true);
    });
  });
};

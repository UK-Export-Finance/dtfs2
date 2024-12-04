import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withBooleanTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedParameter }: WithSchemaTestParams<Schema>) => {
  describe('with boolean tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    it('should fail parsing if the parameter is not a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('true'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(true));
      expect(success).toBe(true);
    });
  });
};

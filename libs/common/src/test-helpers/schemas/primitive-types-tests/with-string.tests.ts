import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withStringTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedParameter }: WithSchemaTestParams<Schema>) => {
  describe('with string tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    it('should fail parsing if the parameter is not a string', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(1));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a string', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('a string'));
      expect(success).toBe(true);
    });
  });
};

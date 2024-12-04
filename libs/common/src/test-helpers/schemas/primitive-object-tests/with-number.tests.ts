import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withNumberTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedField }: WithSchemaTestParams<Schema>) => {
  describe('with number tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not a number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('1'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(1));
      expect(success).toBe(true);
    });
  });
};

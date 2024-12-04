import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from './with-schema-test.type';
import { TEAM_IDS } from '../../../constants';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withTfmTeamSchemaTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedField }: WithSchemaTestParams<Schema>) => {
  describe('with TfmTeamSchema tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not a valid tfm-team', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('not-a-team'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid tfm-team', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(TEAM_IDS.PIM));
      expect(success).toBe(true);
    });
  });
};

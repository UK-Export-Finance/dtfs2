import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { TEAM_IDS } from '../../../constants';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';

export const withTfmTeamSchemaTests = <Schema extends ZodSchema>({ schema, options = {}, getTestObjectWithUpdatedParameter }: WithSchemaTestParams<Schema>) => {
  describe('with TfmTeamSchema tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    it('should fail parsing if the parameter is not a valid tfm-team', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('not-a-team'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid tfm-team', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(TEAM_IDS.PIM));
      expect(success).toBe(true);
    });
  });
};

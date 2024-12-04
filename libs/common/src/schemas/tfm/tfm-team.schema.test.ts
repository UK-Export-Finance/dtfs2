import { withTfmTeamSchemaTests } from '../../test-helpers/schemas/schema-tests/with-tfm-team-schema.tests';
import { TfmTeamSchema } from './tfm-team.schema';

describe('tfm-team.schema', () => {
  withTfmTeamSchemaTests({
    schema: TfmTeamSchema,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    options: { isOptional: false },
  });
});

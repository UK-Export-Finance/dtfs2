import { withTfmTeamSchemaTests } from '../../test-helpers';
import { TfmTeamSchema } from './tfm-team.schema';

describe('tfm-team.schema', () => {
  withTfmTeamSchemaTests({
    schema: TfmTeamSchema,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    options: { isOptional: false },
  });
});

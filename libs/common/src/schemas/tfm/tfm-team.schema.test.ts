import { withTfmTeamSchemaTests } from '@ukef/test-helpers/schemas';
import { TfmTeamSchema } from './tfm-team.schema';

describe('tfm-team.schema', () => {
  withTfmTeamSchemaTests({
    schema: TfmTeamSchema,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
    options: { isOptional: false },
  });
});

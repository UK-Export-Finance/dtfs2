import { withTfmSessionUserSchemaTests } from '../../test-helpers';
import { TFM_SESSION_USER_SCHEMA } from './tfm-session-user.schema';

describe('TFM_SESSION_USER_SCHEMA', () => {
  withTfmSessionUserSchemaTests({
    schema: TFM_SESSION_USER_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

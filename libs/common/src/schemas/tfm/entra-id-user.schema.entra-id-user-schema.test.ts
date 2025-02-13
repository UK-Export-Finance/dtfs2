import { withEntraIdUserSchemaTests } from '../../test-helpers/schemas';
import { ENTRA_ID_USER_SCHEMA } from './entra-id-user.schema';

describe('ENTRA_ID_USER_SCHEMA', () => {
  withEntraIdUserSchemaTests({
    schema: ENTRA_ID_USER_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

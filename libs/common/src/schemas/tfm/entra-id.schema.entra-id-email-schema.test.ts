import { withEntraIdEmailSchemaTests } from '../../test-helpers/schemas';
import { ENTRA_ID_EMAIL_SCHEMA } from './entra-id-email.schema';

describe('entra-id.schema', () => {
  withEntraIdEmailSchemaTests({
    schema: ENTRA_ID_EMAIL_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
    options: { isOptional: false },
  });
});

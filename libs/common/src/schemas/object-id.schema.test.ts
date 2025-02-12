import { OBJECT_ID_SCHEMA, OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA, OBJECT_ID_STRING_SCHEMA } from './object-id.schema';
import { withObjectIdSchemaTests } from '../test-helpers/schemas-backend/custom-types-tests/with-object-id-schema.tests';
import { withObjectIdOrObjectIdStringSchemaTests } from '../test-helpers/schemas-backend/custom-types-tests/with-object-id-or-object-id-string-schema.tests';
import { withObjectIdStringSchemaTests } from '../test-helpers/schemas-backend/custom-types-tests/with-object-id-string-schema.tests';

describe('OBJECT_ID_SCHEMA', () => {
  withObjectIdSchemaTests({
    schema: OBJECT_ID_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

describe('OBJECT_ID_STRING_SCHEMA', () => {
  withObjectIdStringSchemaTests({
    schema: OBJECT_ID_STRING_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

describe('OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA', () => {
  withObjectIdOrObjectIdStringSchemaTests({
    schema: OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

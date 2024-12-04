import { withUnixTimestampMillisecondsSchemaTests, withUnixTimestampSchemaTests, withUnixTimestampSecondsSchemaTests } from '../test-helpers';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA, UNIX_TIMESTAMP_SCHEMA, UNIX_TIMESTAMP_SECONDS_SCHEMA } from './unix-timestamp.schema';

describe('UNIX_TIMESTAMP_SCHEMA', () => {
  withUnixTimestampSchemaTests({
    schema: UNIX_TIMESTAMP_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
  });
});

describe('UNIX_TIMESTAMP_MILLISECONDS_SCHEMA', () => {
  withUnixTimestampMillisecondsSchemaTests({
    schema: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
  });
});

describe('UNIX_TIMESTAMP_SECONDS_SCHEMA', () => {
  withUnixTimestampSecondsSchemaTests({
    schema: UNIX_TIMESTAMP_SECONDS_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
  });
});

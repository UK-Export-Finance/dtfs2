import { withUnixTimestampMillisecondsSchemaTests, withUnixTimestampSchemaTests, withUnixTimestampSecondsSchemaTests } from '../test-helpers';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA, UNIX_TIMESTAMP_SCHEMA, UNIX_TIMESTAMP_SECONDS_SCHEMA } from './unix-timestamp.schema';

describe('UNIX_TIMESTAMP_SCHEMA', () => {
  withUnixTimestampSchemaTests({
    schema: UNIX_TIMESTAMP_SCHEMA,
    getTestObjectWithUpdatedField: (newValue) => newValue,
  });
});

describe('UNIX_TIMESTAMP_MILLISECONDS_SCHEMA', () => {
  withUnixTimestampMillisecondsSchemaTests({
    schema: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA,
    getTestObjectWithUpdatedField: (newValue) => newValue,
  });
});

describe('UNIX_TIMESTAMP_SECONDS_SCHEMA', () => {
  withUnixTimestampSecondsSchemaTests({
    schema: UNIX_TIMESTAMP_SECONDS_SCHEMA,
    getTestObjectWithUpdatedField: (newValue) => newValue,
  });
});

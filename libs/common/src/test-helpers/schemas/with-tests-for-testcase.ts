import { ZodSchema } from 'zod';
import {
  withUnixTimestampMillisecondsSchemaTests,
  withUnixTimestampSecondsSchemaTests,
  withUnixTimestampSchemaTests,
  withObjectIdSchemaTests,
  withObjectIdStringSchemaTests,
  withObjectIdOrObjectIdStringSchemaTests,
  withIsoDateTimeStampSchemaTests,
} from './custom-objects-tests';
import { withStringTests, withNumberTests, withBooleanTests, withArrayTests } from './primitive-object-tests';
import { withTfmTeamSchemaTests, withAuditDatabaseRecordSchemaTests, withEntraIdUserSchemaTests } from './schema-tests';
import { TestCase } from './with-test-for-test-case.type';

/**
 * Gets tests for a test case, using the test case type to determine which tests to run
 *
 * These tests are all available tests that can be easily used to test a parameter, and should be extended
 */
export const withTestsForTestcase = <Schema extends ZodSchema>({
  schema,
  testCase,
  getTestObjectWithUpdatedParameter,
}: {
  schema: Schema;
  testCase: TestCase;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
}) => {
  const { type, options } = testCase;

  switch (type) {
    case 'string':
      withStringTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'number':
      withNumberTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'boolean':
      withBooleanTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'Array':
      withArrayTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'TfmTeamSchema':
      withTfmTeamSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA':
      withUnixTimestampMillisecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'UNIX_TIMESTAMP_SECONDS_SCHEMA':
      withUnixTimestampSecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'UNIX_TIMESTAMP_SCHEMA':
      withUnixTimestampSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'OBJECT_ID_SCHEMA':
      withObjectIdSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'OBJECT_ID_STRING_SCHEMA':
      withObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA':
      withObjectIdOrObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'ISO_DATE_TIME_STAMP_SCHEMA':
      withIsoDateTimeStampSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'AUDIT_DATABASE_RECORD_SCHEMA':
      withAuditDatabaseRecordSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    case 'ENTRA_ID_USER_SCHEMA':
      withEntraIdUserSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
      });
      break;

    default:
      throw Error(`There are no existing test cases for the type ${type}`);
  }
};

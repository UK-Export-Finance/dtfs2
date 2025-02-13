import { ZodSchema } from 'zod';
import {
  withUnixTimestampMillisecondsSchemaTests,
  withUnixTimestampSecondsSchemaTests,
  withUnixTimestampSchemaTests,
  withIsoDateTimeStampSchemaTests,
  withTfmTeamSchemaTests,
  withCurrencySchemaTests,
} from '../custom-types-tests';
import { withStringTests, withNumberTests, withBooleanTests, withArrayTests } from '../primitive-types-tests';
import { withEntraIdUserSchemaTests, withUpsertTfmUserRequestSchemaTests } from '../schema-tests';
import { withIsoDateTimeStampToDateSchemaTests } from '../transformation-tests';
import { WithTestsForTestCaseProps } from '../types/with-tests-for-test-case';
import { BaseTestCase } from '../test-cases/base-test-case';

/**
 * Gets tests for a test case, using the test case type to determine which tests to run
 *
 * These tests are all available tests that can be easily used to test a parameter, and should be extended
 */
export const withTestsForTestcase = <Schema extends ZodSchema>(props: WithTestsForTestCaseProps<Schema, BaseTestCase>): void => {
  const { schema, testCase, getTestObjectWithUpdatedParameter, getUpdatedParameterFromParsedTestObject } = props;
  const { type, options } = testCase;

  switch (type) {
    case 'string':
      withStringTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'number':
      withNumberTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'boolean':
      withBooleanTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'Array':
      withArrayTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'TfmTeamSchema':
      withTfmTeamSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA':
      withUnixTimestampMillisecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'UNIX_TIMESTAMP_SECONDS_SCHEMA':
      withUnixTimestampSecondsSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'UNIX_TIMESTAMP_SCHEMA':
      withUnixTimestampSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'ISO_DATE_TIME_STAMP_SCHEMA':
      withIsoDateTimeStampSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'ENTRA_ID_USER_SCHEMA':
      withEntraIdUserSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'CURRENCY_SCHEMA':
      withCurrencySchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA':
      withIsoDateTimeStampToDateSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'UPSERT_TFM_USER_REQUEST_SCHEMA':
      withUpsertTfmUserRequestSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    default:
      throw Error(`There are no existing test cases for the type ${type}`);
  }
};

import { ZodSchema } from 'zod';
import { withObjectIdSchemaTests } from '../backend-custom-types-tests/with-object-id-schema.tests';
import { withObjectIdStringSchemaTests } from '../backend-custom-types-tests/with-object-id-string-schema.tests';
import { withObjectIdOrObjectIdStringSchemaTests } from '../backend-custom-types-tests/with-object-id-or-object-id-string-schema.tests';
import { withAuditDatabaseRecordSchemaTests, withTfmSessionUserSchemaTests } from '../backend-schema-tests';
import { WithTestsForTestCaseProps } from '../types/with-tests-for-test-case';
import { withTestsForTestcase } from '../tests/with-tests-for-testcase';
import { BaseTestCase } from '../test-cases/base-test-case';

/**
 * Gets tests for a test case, using the test case type to determine which tests to run
 *
 * These tests are all available tests that can be easily used to test a parameter, and should be extended
 */
export const withTestsForBackendTestcase = <Schema extends ZodSchema>(props: WithTestsForTestCaseProps<Schema, BaseTestCase>): void => {
  const { schema, testCase, getTestObjectWithUpdatedParameter, getUpdatedParameterFromParsedTestObject } = props;
  const { type, options } = testCase;

  switch (type) {
    case 'OBJECT_ID_SCHEMA':
      withObjectIdSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'OBJECT_ID_STRING_SCHEMA':
      withObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA':
      withObjectIdOrObjectIdStringSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'AUDIT_DATABASE_RECORD_SCHEMA':
      withAuditDatabaseRecordSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    case 'TFM_SESSION_USER_SCHEMA':
      withTfmSessionUserSchemaTests({
        schema,
        options,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
      break;

    default:
      // We fall through to the normal tests by default, which throws an error if the type is not found
      withTestsForTestcase({
        schema,
        testCase,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
  }
};

import { ZodSchema } from 'zod';
import { TestCase } from './with-test-for-test-case.type';
import { withObjectIdSchemaTests } from './custom-types-tests/with-object-id-schema.tests';
import { withObjectIdStringSchemaTests } from './custom-types-tests/with-object-id-string-schema.tests';
import { withObjectIdOrObjectIdStringSchemaTests } from './custom-types-tests/with-object-id-or-object-id-string-schema.tests';
import { withAuditDatabaseRecordSchemaTests } from './schema-tests';

/**
 * Gets tests for a test case, using the test case type to determine which tests to run
 *
 * These tests are all available tests that can be easily used to test a parameter, and should be extended
 */
export const withTestsForTestcase = <Schema extends ZodSchema>({
  schema,
  testCase,
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: {
  schema: Schema;
  testCase: TestCase;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
  getUpdatedParameterFromParsedTestObject: (parsedTestObject: unknown) => unknown;
}) => {
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

    default:
      throw Error(`There are no existing test cases for the type ${type}`);
  }
};

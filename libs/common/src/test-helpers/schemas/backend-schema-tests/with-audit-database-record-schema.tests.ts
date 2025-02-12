import { ZodSchema } from 'zod';
import { ObjectId } from 'mongodb';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { generateTfmUserAuditDatabaseRecord } from '../../../change-stream';
import { withDefaultOptionsTests } from '../primitive-types-tests';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { withTestsForBackendTestcase } from '../backend-tests/with-tests-for-backend-testcase';
import { BackendTestCase } from '../backend-test-cases/backend-test-cases';

export const withAuditDatabaseRecordSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with AUDIT_DATABASE_RECORD_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
      options,
    });

    withSchemaValidationTests<Schema, BackendTestCase>({
      withTestsForTestCases: withTestsForBackendTestcase,
      schema,
      aValidPayload: aValidAuditRecord,
      testCases: [
        {
          parameterPath: 'lastUpdatedAt',
          type: 'ISO_DATE_TIME_STAMP_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aValidAuditRecord(), lastUpdatedAt: newValue }),
          },
        },
        {
          parameterPath: 'lastUpdatedByPortalUserId',
          type: 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aValidAuditRecord(), lastUpdatedByPortalUserId: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'lastUpdatedByTfmUserId',
          type: 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aValidAuditRecord(), lastUpdatedByPortalUserId: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'lastUpdatedByIsSystem',
          type: 'boolean',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aValidAuditRecord(), lastUpdatedByIsSystem: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'noUserLoggedIn',
          type: 'boolean',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedParameter({ ...aValidAuditRecord(), noUserLoggedIn: newValue }),
            isNullable: true,
          },
        },
      ],
    });
  });

  function aValidAuditRecord() {
    return generateTfmUserAuditDatabaseRecord(new ObjectId());
  }
};

import { ZodSchema } from 'zod';
import { ObjectId } from 'mongodb';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { generateTfmUserAuditDatabaseRecord } from '../../../change-stream';
import { withSchemaValidationTests } from '../with-schema-validation.tests';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';

export const withAuditDatabaseRecordSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedField,
}: WithSchemaTestParams<Schema>) => {
  describe('with AUDIT_DATABASE_RECORD_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedField,
      options,
    });

    withSchemaValidationTests({
      schema,
      aValidPayload: aValidAuditRecord,
      testCases: [
        {
          parameterPath: 'lastUpdatedAt',
          type: 'ISO_DATE_TIME_STAMP_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidAuditRecord(), lastUpdatedAt: newValue }),
          },
        },
        {
          parameterPath: 'lastUpdatedByPortalUserId',
          type: 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedField({ ...aValidAuditRecord(), lastUpdatedByPortalUserId: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'lastUpdatedByTfmUserId',
          type: 'OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedField({ ...aValidAuditRecord(), lastUpdatedByPortalUserId: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'lastUpdatedByIsSystem',
          type: 'boolean',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) =>
              getTestObjectWithUpdatedField({ ...aValidAuditRecord(), lastUpdatedByIsSystem: newValue }),
            isNullable: true,
          },
        },
        {
          parameterPath: 'noUserLoggedIn',
          type: 'boolean',
          options: {
            overrideGetTestObjectWithUpdatedField: (newValue: unknown) => getTestObjectWithUpdatedField({ ...aValidAuditRecord(), noUserLoggedIn: newValue }),
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

import { withAuditDatabaseRecordSchemaTests } from '../test-helpers/schemas-backend/schema-tests/with-audit-database-record-schema.tests';
import { AUDIT_DATABASE_RECORD_SCHEMA } from './audit-database-record.schema';

describe('AUDIT_DATABASE_RECORD_SCHEMA', () => {
  withAuditDatabaseRecordSchemaTests({
    schema: AUDIT_DATABASE_RECORD_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue) => newValue,
    getUpdatedParameterFromParsedTestObject: (data) => data,
  });
});

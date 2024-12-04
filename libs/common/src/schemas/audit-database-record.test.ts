import { withAuditDatabaseRecordSchemaTests } from '../test-helpers/schemas/primitives/with-audit-database-record-schema.tests';
import { AUDIT_DATABASE_RECORD_SCHEMA } from './audit-database-record.schema';

describe('AUDIT_DATABASE_RECORD', () => {
  withAuditDatabaseRecordSchemaTests({
    schema: AUDIT_DATABASE_RECORD_SCHEMA,
    getTestObjectWithUpdatedField: (newValue) => newValue,
  });
});

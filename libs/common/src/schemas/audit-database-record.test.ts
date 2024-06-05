import { ObjectId } from 'mongodb';
import {
  generateNoUserLoggedInAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateTfmUserAuditDatabaseRecord,
} from '../change-stream';
import { withSchemaValidationTests } from './with-schema-validation.tests';
import { AUDIT_DATABASE_RECORD } from './audit-database-record';

describe('AUDIT_DATABASE_RECORD', () => {
  const A_VALID_AUDIT_RECORD = generateTfmUserAuditDatabaseRecord(new ObjectId());
  const { lastUpdatedAt: _lastUpdatedAt, ...AN_AUDIT_RECORD_WITH_MISSING_PARAMETER } = { ...A_VALID_AUDIT_RECORD };
  const AN_AUDIT_RECORD_WITH_INCORRECT_PARAMETER_TYPE = { ...A_VALID_AUDIT_RECORD, lastUpdatedAt: 1 };

  const successTestCases = [
    {
      description: 'a valid tfm user audit database record',
      testCase: generateTfmUserAuditDatabaseRecord(new ObjectId()),
    },
    {
      description: 'a valid portal user audit database record',
      testCase: generatePortalUserAuditDatabaseRecord(new ObjectId()),
    },
    {
      description: 'a valid system audit database record',
      testCase: generateSystemAuditDatabaseRecord(),
    },
    { description: 'a valid audit record with no user logged in', testCase: generateNoUserLoggedInAuditDatabaseRecord() },
  ];

  const failureTestCases = [
    { description: 'a string', testCase: 'string' },
    { description: 'an object', testCase: { An: 'object' } },
    { description: 'an array', testCase: ['array'] },
    { description: 'a matching object with an incorrect parameter type', testCase: AN_AUDIT_RECORD_WITH_INCORRECT_PARAMETER_TYPE },
    { description: 'a matching object with a missing parameter', testCase: AN_AUDIT_RECORD_WITH_MISSING_PARAMETER },
    { description: 'a matching object with an additional parameter', testCase: { ...A_VALID_AUDIT_RECORD, invalidField: true } },
  ];

  withSchemaValidationTests({
    successTestCases,
    failureTestCases,
    schema: AUDIT_DATABASE_RECORD,
    schemaName: 'AUDIT_DATABASE_RECORD',
  });
});

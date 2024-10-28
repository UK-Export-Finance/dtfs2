import { ObjectId } from 'mongodb';
import {
  generateNoUserLoggedInAuditDatabaseRecord,
  generatePortalUserAuditDatabaseRecord,
  generateSystemAuditDatabaseRecord,
  generateTfmUserAuditDatabaseRecord,
} from '../change-stream';
import { AUDIT_DATABASE_RECORD } from './audit-database-record';
import { withSchemaTests } from '../test-helpers';

describe('AUDIT_DATABASE_RECORD', () => {
  withSchemaTests({
    successTestCases: getSuccessTestCases(),
    failureTestCases: getFailureTestCases(),
    schema: AUDIT_DATABASE_RECORD,
  });
});

const aValidAuditRecord = () => generateTfmUserAuditDatabaseRecord(new ObjectId());

function getSuccessTestCases() {
  return [
    {
      description: 'a valid tfm user audit database record',
      aTestCase: () => generateTfmUserAuditDatabaseRecord(new ObjectId()),
    },
    {
      description: 'a valid portal user audit database record',
      aTestCase: () => generatePortalUserAuditDatabaseRecord(new ObjectId()),
    },
    {
      description: 'a valid system audit database record',
      aTestCase: () => generateSystemAuditDatabaseRecord(),
    },
    { description: 'a valid audit record with no user logged in', aTestCase: () => generateNoUserLoggedInAuditDatabaseRecord() },
  ];
}

function getFailureTestCases() {
  return [
    { description: 'a string', aTestCase: () => 'string' },
    { description: 'an object', aTestCase: () => ({ An: 'object' }) },
    { description: 'an array', aTestCase: () => ['array'] },
    { description: 'a matching object with an incorrect parameter type', aTestCase: () => ({ ...aValidAuditRecord(), _lastUpdatedAt: 1 }) },
    {
      description: 'a matching object with a missing parameter',
      aTestCase: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { lastUpdatedAt, ...rest } = aValidAuditRecord();
        return rest;
      },
    },
    { description: 'a matching object with an additional parameter', aTestCase: () => ({ ...aValidAuditRecord(), invalidField: true }) },
  ];
}

import { ObjectId } from 'mongodb';
import { generatePortalUserAuditDatabaseRecord } from '../change-stream';
import { UPDATE } from './portal-user';
import { withSchemaTests } from '../test-helpers';

describe('PORTAL_USER', () => {
  describe('UPDATE', () => {
    withSchemaTests({
      successTestCases: getSuccessTestCases(),
      failureTestCases: getFailureTestCases(),
      schema: UPDATE,
    });
  });
});

function getSuccessTestCases() {
  return [
    { description: 'a valid user', aTestCase: () => aValidPortalUser() },
    {
      description: 'a partial user',
      aTestCase: () => {
        const { username: _username, ...rest } = aValidPortalUser();
        return rest;
      },
    },
  ];
}

function getFailureTestCases() {
  return [
    { description: 'a string', aTestCase: () => 'string' },
    { description: 'an object', aTestCase: () => ({ An: 'object' }) },
    { description: 'an array', aTestCase: () => ['array'] },
    { description: 'a user with an additional parameter', aTestCase: () => ({ ...aValidPortalUser(), invalidField: true }) },
  ];
}

function aValidPortalUser() {
  return {
    username: 'HSBC-maker-1',
    firstname: 'Mister',
    surname: 'One',
    email: 'one@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      id: '961',
      name: 'HSBC',
      emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
    'user-status': 'active',
    salt: '01',
    hash: '02',
    auditRecord: generatePortalUserAuditDatabaseRecord(new ObjectId()),
  };
}

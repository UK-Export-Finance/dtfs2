import { ObjectId } from 'mongodb';
import { generatePortalUserAuditDatabaseRecord } from '../change-stream';
import { CREATE, UPDATE } from './portal-user';
import { withSchemaValidationTests } from './with-schema-validation.tests';

describe('PORTAL_USER', () => {
  const A_VALID_USER = {
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

  const { username: _username, ...A_PARTIAL_USER } = A_VALID_USER;

  describe('CREATE', () => {
    const successTestCases = [{ description: 'a valid user', testCase: A_VALID_USER }];

    const failureTestCases = [
      { description: 'a string', testCase: 'string' },
      { description: 'an object', testCase: { An: 'object' } },
      { description: 'an array', testCase: ['array'] },
      { description: 'a partial user', testCase: A_PARTIAL_USER },
      { description: 'a user with an additional parameter', testCase: { ...A_VALID_USER, invalidField: true } },
    ];

    withSchemaValidationTests({
      successTestCases,
      failureTestCases,
      schema: CREATE,
      schemaName: 'PORTAL_USER.CREATE',
    });
  });

  describe('UPDATE', () => {
    const successTestCases = [
      { description: 'a valid user', testCase: A_VALID_USER },
      { description: 'a partial user', testCase: A_PARTIAL_USER },
    ];

    const failureTestCases = [
      { description: 'a string', testCase: 'string' },
      { description: 'an object', testCase: { An: 'object' } },
      { description: 'an array', testCase: ['array'] },
      { description: 'a user with an additional parameter', testCase: { ...A_PARTIAL_USER, invalidField: true } },
    ];
    withSchemaValidationTests({
      successTestCases,
      failureTestCases,
      schema: UPDATE,
      schemaName: 'PORTAL_USER.UPDATE',
    });
  });
});

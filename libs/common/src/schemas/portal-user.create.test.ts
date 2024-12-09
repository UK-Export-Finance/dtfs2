import { ObjectId } from 'mongodb';
import z from 'zod';
import { generatePortalUserAuditDatabaseRecord } from '../change-stream';
import { CREATE } from './portal-user';
import { withSchemaValidationTests } from '../test-helpers';

describe('PORTAL_USER', () => {
  describe('CREATE', () => {
    withSchemaValidationTests({
      schema: CREATE,
      aValidPayload,
      testCases: [
        {
          parameterPath: 'username',
          type: 'string',
        },
        {
          parameterPath: 'firstname',
          type: 'string',
        },
        {
          parameterPath: 'surname',
          type: 'string',
        },
        {
          parameterPath: 'email',
          type: 'string',
        },
        {
          parameterPath: 'timezone',
          type: 'string',
        },
        {
          parameterPath: 'roles',
          type: 'Array',
          options: {
            arrayTypeTestCase: {
              type: 'string',
            },
          },
        },
        {
          parameterPath: 'user-status',
          type: 'string',
        },

        {
          parameterPath: 'salt',
          type: 'string',
        },
        {
          parameterPath: 'hash',
          type: 'string',
        },
        {
          parameterPath: 'auditRecord',
          type: 'AUDIT_DATABASE_RECORD_SCHEMA',
        },
        {
          parameterPath: 'isTrusted',
          type: 'boolean',
        },
        {
          parameterPath: 'disabled',
          type: 'boolean',
          options: { isOptional: true },
        },
      ],
    });
  });
});

function aValidPayload(): z.infer<typeof CREATE> {
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

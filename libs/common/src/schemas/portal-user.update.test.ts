import { ObjectId } from 'mongodb';
import z from 'zod';
import { generatePortalUserAuditDatabaseRecord } from '../change-stream';
import { UPDATE } from './portal-user';
import { withSchemaValidationTests } from '../test-helpers';

describe('PORTAL_USER', () => {
  describe('UPDATE', () => {
    withSchemaValidationTests({
      schema: UPDATE,
      aValidPayload,
      testCases: [
        {
          parameterPath: 'username',
          type: 'string',
          options: { isOptional: true },
        },
        {
          parameterPath: 'firstname',
          type: 'string',
          options: { isOptional: true },
        },
        {
          parameterPath: 'surname',
          type: 'string',
          options: { isOptional: true },
        },
        {
          parameterPath: 'email',
          type: 'string',
          options: { isOptional: true },
        },
        {
          parameterPath: 'timezone',
          type: 'string',
          options: { isOptional: true },
        },
        {
          parameterPath: 'roles',
          type: 'Array',
          options: {
            isOptional: true,
            arrayTypeTestCase: {
              type: 'string',
            },
          },
        },
        {
          parameterPath: 'user-status',
          type: 'string',

          options: { isOptional: true },
        },

        {
          parameterPath: 'salt',
          type: 'string',

          options: { isOptional: true },
        },
        {
          parameterPath: 'hash',
          type: 'string',

          options: { isOptional: true },
        },
        {
          parameterPath: 'auditRecord',
          type: 'AUDIT_DATABASE_RECORD_SCHEMA',

          options: { isOptional: true },
        },
        {
          parameterPath: 'isTrusted',
          type: 'boolean',

          options: { isOptional: true },
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

function aValidPayload(): z.infer<typeof UPDATE> {
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

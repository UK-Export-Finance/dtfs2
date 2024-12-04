import { ObjectId } from 'mongodb';
import z from 'zod';
import { generatePortalUserAuditDatabaseRecord } from '../change-stream';
import { UPDATE } from './portal-user';
import { withSchemaValidationTests } from '../test-helpers';

describe('PORTAL_USER', () => {
  describe('UPDATE', () => {
    withSchemaValidationTests({
      schema: UPDATE,
      schemaTestOptions: {
        isPartial: true,
      },
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
        },
        {
          parameterPath: 'lastLogin',
          type: 'UNIX_TIMESTAMP_MILLISECONDS_SCHEMA',
        },
        {
          parameterPath: 'loginFailureCount',
          type: 'number',
        },
        {
          parameterPath: 'passwordUpdatedAt',
          type: 'number',
        },
        {
          parameterPath: 'resetPwdToken',
          type: 'string',
        },
        {
          parameterPath: 'resetPwdTimestamp',
          type: 'string',
        },
        {
          parameterPath: 'sessionIdentifier',
          type: 'string',
        },
        {
          parameterPath: 'signInLinkSendDate',
          type: 'number',
        },
        {
          parameterPath: 'signInLinkSendCount',
          type: 'number',
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
    lastLogin: 1620000000000,
    loginFailureCount: 0,
    passwordUpdatedAt: 1620000000000,
    resetPwdToken: 'resetPwdToken',
    resetPwdTimestamp: 'resetPwdTimestamp',
    sessionIdentifier: 'sessionIdentifier',
    signInLinkSendDate: 1620000000000,
    signInLinkSendCount: 0,
  };
}

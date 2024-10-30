import z from 'zod';
import { AUDIT_DATABASE_RECORD } from './audit-database-record';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from './unix-timestamp.schema';

const BASE_PORTAL_USER_SCHEMA = z
  .object({
    username: z.string(),
    firstname: z.string(),
    surname: z.string(),
    email: z.string(),
    timezone: z.string(),
    roles: z.array(z.string()),
    bank: z.object({}),
    'user-status': z.string(),
    salt: z.string(),
    hash: z.string(),
    auditRecord: AUDIT_DATABASE_RECORD,
    isTrusted: z.boolean(),
    disabled: z.boolean().optional(),
  })
  .strict();

export const CREATE = BASE_PORTAL_USER_SCHEMA;

export const UPDATE = BASE_PORTAL_USER_SCHEMA.extend({
  blockedPasswordList: z.array(z.object({})),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA,
  loginFailureCount: z.number(),
  passwordUpdatedAt: z.number(),
  resetPwdToken: z.string(),
  resetPwdTimestamp: z.string(),
  sessionIdentifier: z.string(),
  signInLinkSendDate: z.number(),
  signInLinkSendCount: z.number(),
})
  .partial()
  .strict();

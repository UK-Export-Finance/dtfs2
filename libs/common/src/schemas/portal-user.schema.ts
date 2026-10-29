import zod from 'zod';
import { AUDIT_DATABASE_RECORD_SCHEMA } from './audit-database-record.schema';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from './unix-timestamp.schema';

const BASE_PORTAL_USER_SCHEMA = z
  .object({
    username: zod.string(),
    firstname: zod.string(),
    surname: zod.string(),
    email: zod.string(),
    timezone: zod.string(),
    roles: zod.array(zod.string()),
    bank: zod.object({}),
    'user-status': zod.string(),
    salt: zod.string(),
    hash: zod.string(),
    auditRecord: AUDIT_DATABASE_RECORD_SCHEMA,
    isTrusted: zod.boolean(),
    disabled: zod.boolean().optional(),
  })
  .strict();

export const CREATE = BASE_PORTAL_USER_SCHEMA;

export const UPDATE = BASE_PORTAL_USER_SCHEMA.extend({
  blockedPasswordList: zod.array(zod.object({})),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA,
  loginFailureCount: zod.number(),
  passwordUpdatedAt: zod.number(),
  resetPwdToken: zod.string(),
  resetPwdTimestamp: zod.string(),
  sessionIdentifier: zod.string(),
  signInLinkSendDate: zod.number(),
  signInLinkSendCount: zod.number(),
})
  .partial()
  .strict();

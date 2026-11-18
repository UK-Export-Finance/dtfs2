import zod from 'zod';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from '@ukef/schemas/unix-timestamp.schema';
import { AUDIT_DATABASE_RECORD_SCHEMA } from '@ukef/schemas/audit-database-record.schema';
import { OBJECT_ID_SCHEMA } from '@ukef/schemas/object-id.schema';
import { TfmTeamSchema } from './tfm-team.schema';

/**
 * These fields only are relevant to users when SSO is not enabled
 */
const TFM_USER_NON_SSO_SPECIFIC_SCHEMA = zod.object({
  salt: zod.string(),
  hash: zod.string(),
  loginFailureCount: zod.number().optional(),
});

/**
 * These fields only are relevant to users when SSO is enabled
 */
const TFM_USER_SSO_SPECIFIC_SCHEMA = zod.object({
  azureOid: zod.string(),
});

/**
 * The base schema for a TFM user
 * This schema contains login agnostic properties of a TFM user
 */
const BASE_TFM_USER_SCHEMA = zod.object({
  _id: OBJECT_ID_SCHEMA,
  username: zod.string(),
  email: zod.string(),
  teams: zod.array(TfmTeamSchema),
  timezone: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
  status: zod.string(),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA.optional(),
  sessionIdentifier: zod.string().optional(),
  auditRecord: AUDIT_DATABASE_RECORD_SCHEMA.optional(),
});

/**
 * The user schema can contain a mix of login specific properties
 */
export const TFM_USER_SCHEMA = BASE_TFM_USER_SCHEMA.merge(TFM_USER_NON_SSO_SPECIFIC_SCHEMA.partial()).merge(TFM_USER_SSO_SPECIFIC_SCHEMA.partial());

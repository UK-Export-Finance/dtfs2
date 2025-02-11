import z from 'zod';
import { TfmTeamSchema } from './tfm-team.schema';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from '../unix-timestamp.schema';
import { AUDIT_DATABASE_RECORD } from '../audit-database-record';
import { OBJECT_ID } from '../object-id';

/**
 * These fields only are relevant to users when SSO is not enabled
 */
const TFM_USER_NON_SSO_SPECIFIC_SCHEMA = z.object({
  salt: z.string(),
  hash: z.string(),
  loginFailureCount: z.number().optional(),
});

/**
 * These fields only are relevant to users when SSO is enabled
 */
const TFM_USER_SSO_SPECIFIC_SCHEMA = z.object({
  azureOid: z.string(),
});

/**
 * The base schema for a TFM user
 * This schema contains login agnostic properties of a TFM user
 */
const BASE_TFM_USER_SCHEMA = z.object({
  _id: OBJECT_ID,
  username: z.string(),
  email: z.string(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.string(),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA.optional(),
  sessionIdentifier: z.string().optional(),
  auditRecord: AUDIT_DATABASE_RECORD.optional(),
});

/**
 * The user schema can contain a mix of login specific properties
 */
export const TFM_USER_SCHEMA = BASE_TFM_USER_SCHEMA.merge(TFM_USER_NON_SSO_SPECIFIC_SCHEMA.partial()).merge(TFM_USER_SSO_SPECIFIC_SCHEMA.partial());

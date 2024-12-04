import z from 'zod';
import { TfmTeamSchema } from './tfm-team.schema';
import { UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from '../unix-timestamp.schema';
import { AUDIT_DATABASE_RECORD_SCHEMA } from '../audit-database-record.schema';
import { OBJECT_ID_SCHEMA } from '../object-id';

// TODO update docs, tests
const TFM_USER_NON_SSO_SPECIFIC_SCHEMA = z.object({
  salt: z.string(),
  hash: z.string(),
  loginFailureCount: z.number().optional(),
});

const TFM_USER_SSO_SPECIFIC_SCHEMA = z.object({
  azureOid: z.string(),
});

const BASE_TFM_USER_SCHEMA = z.object({
  _id: OBJECT_ID_SCHEMA,
  username: z.string(),
  email: z.string(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.string(),
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA.optional(),
  sessionIdentifier: z.string().optional(),
  auditRecord: AUDIT_DATABASE_RECORD_SCHEMA.optional(),
});

export const TFM_USER_SCHEMA = BASE_TFM_USER_SCHEMA.merge(TFM_USER_NON_SSO_SPECIFIC_SCHEMA.partial()).merge(TFM_USER_SSO_SPECIFIC_SCHEMA.partial());

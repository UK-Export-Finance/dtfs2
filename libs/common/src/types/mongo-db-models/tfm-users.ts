import { WithId } from 'mongodb';
import { TeamId } from '../tfm/team-id';
import { UnixTimestampMilliseconds } from '../date';
import { AuditDatabaseRecord } from '../audit-database-record';

/**
 * These properties are only on non-SSO users (TFM users),
 * and can be removed once SSO is permanently enabled.
 * TODO: DTFS2-6892: Remove NonSSOUserProperties once SSO is permanently enabled
 */
type NonSsoUserProperties = {
  salt: string;
  hash: string;
  loginFailureCount?: number;
};

/**
 * These properties are only present on users who have logged in via SSO
 * The azureOid is taken from the EntraId user from the SSO authority
 */

type SsoUserProperties = {
  // Azure Oid will not exist on users that have not logged in via SSO
  azureOid?: string;
};

export type TfmUser = WithId<
  {
    username: string;
    email: string;
    teams: TeamId[];
    timezone: string;
    firstName: string;
    lastName: string;
    status: string;
    lastLogin?: UnixTimestampMilliseconds;
    sessionIdentifier?: string;
    auditRecord?: AuditDatabaseRecord;
  } & Partial<NonSsoUserProperties> &
    Partial<SsoUserProperties>
>;

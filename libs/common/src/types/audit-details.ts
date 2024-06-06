import { ObjectId } from 'mongodb';
import { AuditUserTypesNotRequiringId, AuditUserTypesRequiringId } from './audit-user-types';

/**
 * TFM Endpoints in dtfs-central-api can be called by tfm or portal users and system updates
 * This metadata is attached to requests for use in auditRecord
 */

export type AuditDetails =
  | {
      userType: AuditUserTypesRequiringId;
      id: string | ObjectId;
    }
  | { userType: AuditUserTypesNotRequiringId };

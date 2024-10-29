import { ObjectId } from 'mongodb';
import { AuditUserTypes, AuditUserTypesNotRequiringId, AuditUserTypesRequiringId } from './audit-user-types';
import { AUDIT_USER_TYPES } from '../constants';

/**
 * TFM Endpoints in dtfs-central-api can be called by tfm or portal users and system updates
 * This metadata is attached to requests for use in auditRecord
 *
 * Can be filtered down to specific `AuditUserTypes`
 *
 * @example
 * ```
 * // { userType: 'tfm', id: string | ObjectId }
 * AuditDetails<'tfm'>
 *
 * // { userType: 'system' }
 * AuditDetails<'system'>
 * ```
 */
export type AuditDetails<T extends AuditUserTypes = AuditUserTypes> = (
  | {
      userType: AuditUserTypesRequiringId;
      id: string | ObjectId;
    }
  | { userType: AuditUserTypesNotRequiringId }
) & { userType: T };

/**
 * Audit details for a tfm user
 */
export type TfmAuditDetails = AuditDetails<typeof AUDIT_USER_TYPES.TFM>;

/**
 * Audit details for a portal user
 */
export type PortalAuditDetails = AuditDetails<typeof AUDIT_USER_TYPES.PORTAL>;

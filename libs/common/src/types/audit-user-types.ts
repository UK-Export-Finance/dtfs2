import { AUDIT_USER_TYPES_NOT_REQUIRING_ID, AUDIT_USER_TYPES_REQUIRING_ID } from '../constants';
import { ValuesOf } from './types-helper';

export type AuditUserTypesRequiringId = ValuesOf<typeof AUDIT_USER_TYPES_REQUIRING_ID>;
export type AuditUserTypesNotRequiringId = ValuesOf<typeof AUDIT_USER_TYPES_NOT_REQUIRING_ID>;
export type AuditUserTypes = AuditUserTypesRequiringId | AuditUserTypesNotRequiringId;

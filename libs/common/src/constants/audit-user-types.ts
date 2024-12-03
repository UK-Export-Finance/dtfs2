export const AUDIT_USER_TYPES_REQUIRING_ID = { TFM: 'tfm', PORTAL: 'portal' } as const;
export const AUDIT_USER_TYPES_NOT_REQUIRING_ID = { SYSTEM: 'system', NONE: 'none' } as const;
export const AUDIT_USER_TYPES = { ...AUDIT_USER_TYPES_REQUIRING_ID, ...AUDIT_USER_TYPES_NOT_REQUIRING_ID } as const;
export const AUDIT_USER_TYPES_AS_ARRAY = Object.values(AUDIT_USER_TYPES);

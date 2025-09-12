import {
  AUDIT_USER_TYPES_NOT_REQUIRING_ID,
  AUDIT_USER_TYPES_REQUIRING_ID,
  AuditUserTypesRequiringId,
  AuditUserTypesNotRequiringId,
  API_ERROR_CODE,
} from '@ukef/dtfs2-common';
import z from 'zod';
import { MongoObjectIdSchema } from './mongo-object-id.schema';

const AuditUserTypesNotRequiringIdSchema = z.enum(
  Object.values(AUDIT_USER_TYPES_NOT_REQUIRING_ID) as [AuditUserTypesNotRequiringId, ...AuditUserTypesNotRequiringId[]],
);

const AuditUserTypesRequiringIdSchema = z.enum(Object.values(AUDIT_USER_TYPES_REQUIRING_ID) as [AuditUserTypesRequiringId, ...AuditUserTypesRequiringId[]]);

export const AuditDetailsSchema = z.union(
  [
    z.object({
      userType: AuditUserTypesNotRequiringIdSchema,
    }),
    z.object({
      userType: AuditUserTypesRequiringIdSchema,
      id: MongoObjectIdSchema,
    }),
  ],
  {
    message: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
  },
);

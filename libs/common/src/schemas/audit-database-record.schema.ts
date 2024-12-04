import z from 'zod';
import { ISO_DATE_TIME_STAMP_SCHEMA } from './iso-date-time-stamp.schema';
import { OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA } from './object-id';

export const AUDIT_DATABASE_RECORD_SCHEMA = z
  .object({
    lastUpdatedAt: ISO_DATE_TIME_STAMP_SCHEMA,
    lastUpdatedByPortalUserId: OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA.nullable(),
    lastUpdatedByTfmUserId: OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA.nullable(),
    lastUpdatedByIsSystem: z.boolean().nullable(),
    noUserLoggedIn: z.boolean().nullable(),
  })
  .strict();

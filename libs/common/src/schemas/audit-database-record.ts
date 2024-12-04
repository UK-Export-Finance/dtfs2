import z from 'zod';
import { ISO_DATE_TIME_STAMP } from './iso-date-time-stamp';
import { OBJECT_ID_OR_OBJECT_ID_STRING } from './object-id';

export const AUDIT_DATABASE_RECORD = z
  .object({
    lastUpdatedAt: ISO_DATE_TIME_STAMP,
    lastUpdatedByPortalUserId: OBJECT_ID_OR_OBJECT_ID_STRING.nullable(),
    lastUpdatedByTfmUserId: OBJECT_ID_OR_OBJECT_ID_STRING.nullable(),
    lastUpdatedByIsSystem: z.boolean().nullable(),
    noUserLoggedIn: z.boolean().nullable(),
  })
  .strict();

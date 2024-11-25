import z from 'zod';
import { TfmTeamSchema, UNIX_TIMESTAMP_MILLISECONDS_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { MongoObjectIdSchema } from './mongo-object-id.schema';

export const TfmSessionUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.string(),
  _id: MongoObjectIdSchema,
  lastLogin: UNIX_TIMESTAMP_MILLISECONDS_SCHEMA.optional(),
});

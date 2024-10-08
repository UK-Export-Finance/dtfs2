import z from 'zod';
import { MongoObjectIdSchema } from './mongo-object-id.schema';
import { TfmTeamSchema } from './tfm-team.schema';

export const TfmSessionUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  teams: z.array(TfmTeamSchema),
  timezone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: z.string(),
  _id: MongoObjectIdSchema,
  lastLogin: z.number().optional(),
});

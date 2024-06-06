import { ObjectId } from 'mongodb';
import z from 'zod';

export const MongoObjectIdSchema = z.string().refine((maybeId) => ObjectId.isValid(maybeId), {
  message: 'String must be a valid mongo object id',
});

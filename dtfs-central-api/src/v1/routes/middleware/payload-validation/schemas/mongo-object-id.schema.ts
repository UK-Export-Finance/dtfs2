import { ObjectId } from 'mongodb';
import z from 'zod';

export const MongoObjectIdSchema = z.coerce.string().refine((maybeId) => ObjectId.isValid(maybeId), {
  message: '_id must be a valid mongo object id',
});

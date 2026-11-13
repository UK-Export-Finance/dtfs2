import { ObjectId } from 'mongodb';
import zod from 'zod';

export const MongoObjectIdSchema = zod.coerce.string().refine((id) => ObjectId.isValid(id), {
  message: '_id must be a valid mongo object id',
});

import { ObjectId } from 'mongodb';
import zod from 'zod';

/**
 * A zod schema that represents a valid ObjectId as an ObjectId object
 * This schema also transforms any valid string into an ObjectId object
 */
export const OBJECT_ID_SCHEMA = zod.union([
  zod.instanceof(ObjectId),
  zod
    .string()
    .refine((id) => ObjectId.isValid(id))
    .transform((id) => new ObjectId(id)),
]);

/**
 * A zod schema that represents a valid ObjectId as a string
 * This schema also transforms any valid ObjectId object into a string
 */
export const OBJECT_ID_STRING_SCHEMA = zod.union([
  zod.string().refine((id) => ObjectId.isValid(id)),
  zod.instanceof(ObjectId).transform((id) => id.toString()),
]);

/**
 * A zod schema that represents a valid ObjectId as an ObjectId object or a string
 * This schema does not do any transformation, only validates.
 * This is because we check to see if the value is an ObjectId prior to applying the OBJECT_ID_STRING
 * schema, and zod union returns the first valid schema
 */
export const OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA = zod.union([zod.instanceof(ObjectId), OBJECT_ID_STRING_SCHEMA]);

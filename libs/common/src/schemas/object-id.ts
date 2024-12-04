import { ObjectId } from 'mongodb';
import z from 'zod';

/**
 * A zod schema that represents a valid ObjectId as an ObjectId object
 * This schema also transforms any valid string into an ObjectId object
 */
export const OBJECT_ID_SCHEMA = z.union([
  z.instanceof(ObjectId),
  z
    .string()
    .refine((id) => ObjectId.isValid(id))
    .transform((id) => new ObjectId(id)),
]);

/**
 * A zod schema that represents a valid ObjectId as a string
 * This schema also transforms any valid ObjectId object into a string
 */
export const OBJECT_ID_STRING_SCHEMA = z.union([z.string().refine((id) => ObjectId.isValid(id)), z.instanceof(ObjectId).transform((id) => id.toString())]);

/**
 * A zod schema that represents a valid ObjectId as an ObjectId object or a string
 * This schema does not do any transformation
 */
export const OBJECT_ID_OR_OBJECT_ID_STRING_SCHEMA = z.union([z.instanceof(ObjectId), OBJECT_ID_STRING_SCHEMA, z.string().refine((id) => ObjectId.isValid(id))]);

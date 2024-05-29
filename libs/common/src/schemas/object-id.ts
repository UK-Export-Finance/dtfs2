import { ObjectId } from 'mongodb';
import z from 'zod';

export const OBJECT_ID = z.union([z.instanceof(ObjectId), z.string().refine((id) => ObjectId.isValid(id))]);

import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const PostKeyingDataSchema = z.object({
  user: TfmSessionUserSchema,
});

export type PostKeyingDataPayload = z.infer<typeof PostKeyingDataSchema>;

export const validatePostKeyingDataPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PostKeyingDataSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

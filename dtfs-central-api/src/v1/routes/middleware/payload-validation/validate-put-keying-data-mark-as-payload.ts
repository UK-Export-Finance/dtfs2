import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const PutKeyingDataMarkAsSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)),
  user: TfmSessionUserSchema,
});

export type PutKeyingDataMarkAsPayload = z.infer<typeof PutKeyingDataMarkAsSchema>;

export const validatePutKeyingDataMarkAsPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PutKeyingDataMarkAsSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

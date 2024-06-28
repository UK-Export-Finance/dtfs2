import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const DeletePaymentSchema = z.object({
  user: TfmSessionUserSchema,
});

export type DeletePaymentPayload = z.infer<typeof DeletePaymentSchema>;

export const validateDeletePaymentPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = DeletePaymentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

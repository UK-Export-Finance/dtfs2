import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const PatchPaymentSchema = z.object({
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.string().optional(),
  user: TfmSessionUserSchema,
});

export type PatchPaymentPayload = z.infer<typeof PatchPaymentSchema>;

export const validatePatchPaymentPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PatchPaymentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

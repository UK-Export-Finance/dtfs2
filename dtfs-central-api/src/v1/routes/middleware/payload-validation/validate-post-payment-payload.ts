import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CurrencySchema, TfmSessionUserSchema } from './schemas';

const PostPaymentSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentCurrency: CurrencySchema,
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.string().optional(),
  user: TfmSessionUserSchema,
});

export type PostPaymentPayload = z.infer<typeof PostPaymentSchema>;

export const validatePostPaymentPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PostPaymentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

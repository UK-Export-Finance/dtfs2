import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CurrencySchema, TfmSessionUserSchema } from './schemas';

const PostAddPaymentSchema = z.object({
  feeRecordIds: z.array(z.number().gte(1)).min(1),
  paymentCurrency: CurrencySchema,
  paymentAmount: z.number().gte(0),
  datePaymentReceived: z.coerce.date(),
  paymentReference: z.string().optional(),
  user: TfmSessionUserSchema,
});

export type PostAddPaymentPayload = z.infer<typeof PostAddPaymentSchema>;

export const validatePostAddPaymentPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PostAddPaymentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

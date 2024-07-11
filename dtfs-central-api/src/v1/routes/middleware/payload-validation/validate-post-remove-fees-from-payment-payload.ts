import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const PostRemoveFeesFromPaymentSchema = z.object({
  selectedFeeRecordIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostRemoveFeesFromPaymentPayload = z.infer<typeof PostRemoveFeesFromPaymentSchema>;

export const validatePostRemoveFeesFromPaymentPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PostRemoveFeesFromPaymentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

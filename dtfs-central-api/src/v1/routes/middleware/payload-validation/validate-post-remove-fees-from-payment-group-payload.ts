import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { TfmSessionUserSchema } from './schemas';

const PostRemoveFeesFromPaymentGroupSchema = z.object({
  selectedFeeRecordIds: z.array(z.number().gte(1)).min(1),
  user: TfmSessionUserSchema,
});

export type PostRemoveFeesFromPaymentGroupPayload = z.infer<typeof PostRemoveFeesFromPaymentGroupSchema>;

export const validatePostRemoveFeesFromPaymentGroupPayload = (req: Request, res: Response, next: NextFunction) => {
  const { success, error, data } = PostRemoveFeesFromPaymentGroupSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

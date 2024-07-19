import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';
import z from 'zod';
import { AmendmentStatusSchema, AuditDetailsSchema } from './schemas';

const PutFacilityAmendmentSchema = z.object({
  payload: z.object({
    changeFacilityValue: z.boolean().optional(),
    changeCoverEndDate: z.boolean().optional(),
    ukefExposure: z.number().optional(),
    status: AmendmentStatusSchema.optional(),
  }),
  auditDetails: AuditDetailsSchema,
});

export type PutFacilityAmendmentPayload = z.infer<typeof PutFacilityAmendmentSchema>;

export const validatePutFacilityAmendmentPayload: RequestHandler = (req, res, next) => {
  const { success, error, data } = PutFacilityAmendmentSchema.safeParse(req.body);
  if (success) {
    req.body = data;
    return next();
  }
  return res.status(HttpStatusCode.BadRequest).send(error);
};

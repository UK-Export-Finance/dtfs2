import z from 'zod';
import { AuditDetailsSchema } from './schemas';
import { createValidationMiddlewareForSchema } from './create-validation-middleware-for-schema.ts';

const PutDealCancellationSchema = z.object({
  payload: z
    .object({
      tfm: z.object({
        cancellation: z.object({
          reason: z.string(),
          bankRequestDate: z.number(),
          effectiveFrom: z.number(),
        }),
      }),
    })
    .partial(),
  auditDetails: AuditDetailsSchema,
});

export type PutDealCancellationPayload = z.infer<typeof PutDealCancellationSchema>;

export const validatePutDealCancellationPayload = createValidationMiddlewareForSchema(PutDealCancellationSchema);

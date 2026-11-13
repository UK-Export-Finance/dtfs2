import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PatchPaymentSchema = zod.object({
  paymentAmount: zod.number().gte(0),
  datePaymentReceived: zod.coerce.date(),
  paymentReference: zod.union([zod.string(), zod.null().transform(() => undefined)]),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PatchPaymentPayload = zod.infer<typeof PatchPaymentSchema>;

export const validatePatchPaymentPayload = validateSchema(PatchPaymentSchema);

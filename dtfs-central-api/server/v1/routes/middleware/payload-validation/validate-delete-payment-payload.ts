import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const DeletePaymentSchema = zod.object({
  user: TFM_SESSION_USER_SCHEMA,
});

export type DeletePaymentPayload = zod.infer<typeof DeletePaymentSchema>;

export const validateDeletePaymentPayload = validateSchema(DeletePaymentSchema);

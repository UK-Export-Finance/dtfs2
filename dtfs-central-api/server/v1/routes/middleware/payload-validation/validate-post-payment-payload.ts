import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { CurrencySchema } from './schemas';

const PostPaymentSchema = zod.object({
  feeRecordIds: zod.array(zod.number().gte(1)).min(1),
  paymentCurrency: CurrencySchema,
  paymentAmount: zod.number().gte(0),
  datePaymentReceived: zod.coerce.date(),
  paymentReference: zod.string().optional(),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PostPaymentPayload = zod.infer<typeof PostPaymentSchema>;

export const validatePostPaymentPayload = validateSchema(PostPaymentSchema);

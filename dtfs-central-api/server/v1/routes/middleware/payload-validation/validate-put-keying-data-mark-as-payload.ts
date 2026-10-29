import zod from 'zod';
import { validateSchema } from '@ukef/dtfs2-common';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';

const PutKeyingDataMarkAsSchema = zod.object({
  feeRecordIds: zod.array(zod.number().gte(1)),
  user: TFM_SESSION_USER_SCHEMA,
});

export type PutKeyingDataMarkAsPayload = zod.infer<typeof PutKeyingDataMarkAsSchema>;

export const validatePutKeyingDataMarkAsPayload = validateSchema(PutKeyingDataMarkAsSchema);

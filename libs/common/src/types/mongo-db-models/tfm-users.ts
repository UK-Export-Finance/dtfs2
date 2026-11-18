import zod from 'zod';
import { TFM_USER_SCHEMA } from '@ukef/schemas';

export type TfmUser = zod.infer<typeof TFM_USER_SCHEMA>;

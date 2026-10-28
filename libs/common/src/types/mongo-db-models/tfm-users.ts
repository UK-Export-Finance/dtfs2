import z from 'zod';
import { TFM_USER_SCHEMA } from '@ukef/schemas';

export type TfmUser = z.infer<typeof TFM_USER_SCHEMA>;

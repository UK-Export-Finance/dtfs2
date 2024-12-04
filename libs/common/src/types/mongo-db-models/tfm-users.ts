import z from 'zod';
import { TFM_USER_SCHEMA } from '../../schemas';

export type TfmUser = z.infer<typeof TFM_USER_SCHEMA>;

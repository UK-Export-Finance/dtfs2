import { z } from 'zod';
import { TFM_SESSION_USER_SCHEMA } from '../../schemas';

export type TfmSessionUser = z.infer<typeof TFM_SESSION_USER_SCHEMA>;

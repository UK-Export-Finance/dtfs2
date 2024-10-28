import { z } from 'zod';
import { ENTRA_ID_USER_SCHEMA } from '../../schemas';

export type EntraIdUser = z.infer<typeof ENTRA_ID_USER_SCHEMA>;

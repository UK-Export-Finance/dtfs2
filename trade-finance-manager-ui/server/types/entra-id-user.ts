import { z } from 'zod';
import { EntraIdUserSchema } from '../schemas';

export type EntraIdUser = z.infer<typeof EntraIdUserSchema>;

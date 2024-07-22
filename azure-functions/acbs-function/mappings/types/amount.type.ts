import { z } from 'zod';
import { mappingSchemas } from '../schemas';

export type Amount = z.infer<typeof mappingSchemas.AmountSchema>;

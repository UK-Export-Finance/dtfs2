import { z } from 'zod';
import { mappingSchemas } from '../schemas';

export type GuaranteeExpiryDate = z.infer<typeof mappingSchemas.GuaranteeExpiryDateSchema>;

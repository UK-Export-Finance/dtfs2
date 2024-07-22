import { z } from 'zod';
import { mappingSchemas } from '../schemas';

export type FacilityGuaranteeDates = z.infer<typeof mappingSchemas.FacilityGuaranteeDatesSchema>;

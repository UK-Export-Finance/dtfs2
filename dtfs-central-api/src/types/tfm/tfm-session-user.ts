import z from 'zod';
import { TfmSessionUserSchema } from '../../v1/routes/middleware/payload-validation/schemas';

export type TfmSessionUser = z.infer<typeof TfmSessionUserSchema>;

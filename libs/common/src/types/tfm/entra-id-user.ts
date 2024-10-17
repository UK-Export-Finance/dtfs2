import { z } from 'zod';
import { ENTRA_ID_USER_SCHEMA } from '../../schemas';

/**
 * Represents user fields in the ID Token claims response from Entra ID.
 * Note: there are many more fields in the ID Token claims response, but these
 * are the only ones we care about
 */
export type EntraIdUser = z.infer<typeof ENTRA_ID_USER_SCHEMA>;

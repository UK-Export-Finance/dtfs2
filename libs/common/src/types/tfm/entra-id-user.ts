import { z } from 'zod';
import { ENTRA_ID_USER_SCHEMA } from '../../schemas';

/**
 * Entra ID User during SSO login
 * @see ENTRA_ID_USER_SCHEMA for documentation
 */
export type EntraIdUser = z.infer<typeof ENTRA_ID_USER_SCHEMA>;

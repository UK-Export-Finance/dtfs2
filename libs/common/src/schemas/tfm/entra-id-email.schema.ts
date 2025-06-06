import { z } from 'zod';

/**
 * Zod schema for validating an email address using Entra ID requirements.
 * Ensures the value is a valid email string.
 *
 * @see https://zod.dev/?id=string-email
 */
export const ENTRA_ID_EMAIL_SCHEMA = z.string().email();

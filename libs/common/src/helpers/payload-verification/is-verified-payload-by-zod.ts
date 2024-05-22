import { IsVerifiedPayloadByZodParams } from '../../types/payload-verification';

/**
 * Due to the lack of existing knowledge of certain types, this function should not be used to return a verified payload.
 *
 * Specifically, when relying on `z.object({})`, such as the portal user schema does, the payload returned from parsing an object
 * cannot be used as these objects will be stripped of any parameters
 * This has been done to allow for the migration of the existing codebase to use Zod schemas gradually.
 */
export const isVerifiedPayloadByZod = ({ payload, template }: IsVerifiedPayloadByZodParams): boolean => template.safeParse(payload).success;

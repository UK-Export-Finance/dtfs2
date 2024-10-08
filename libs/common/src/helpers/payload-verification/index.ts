import z from 'zod';
import { IsVerifiedPayloadParams } from '../../types/payload-verification';
import { isVerifiedPayloadByZod } from './is-verified-payload-by-zod';
import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

/**
 * Checks to see if the payload matches the template
 * Can use either type of schema
 * New implementation should use schema and zod
 */
export const isVerifiedPayload = ({ payload, template }: IsVerifiedPayloadParams): boolean => {
  if (template instanceof z.Schema) {
    return isVerifiedPayloadByZod({ payload, template });
  }

  return isVerifiedPayloadByType({ payload, template });
};

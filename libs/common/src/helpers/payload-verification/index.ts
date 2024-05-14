import z from 'zod';
import { IsVerifiedPayloadParams } from '../../types/payload-verification';
import { isVerifiedPayloadByZod } from './is-verified-payload-by-zod';
import { isVerifiedPayloadByType } from './is-verified-payload-by-type';

/**
 * Checks to see if the payload matches the template
 * Can use either type of schema
 * New impolentation should use schema and zod
 */
export const isVerifiedPayload = ({
  payload,
  template,
  areAllPropertiesRequired = true,
}: IsVerifiedPayloadParams): boolean => {
  if (template instanceof z.ZodObject) {
    return isVerifiedPayloadByZod({ payload, template, areAllPropertiesRequired });
  }

  return isVerifiedPayloadByType({ payload, template, areAllPropertiesRequired });
};

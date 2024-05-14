import { IsVerifiedPayloadByZodParams } from '../../types/payload-verification';

export const isVerifiedPayloadByZod = ({
  payload,
  template,
  areAllPropertiesRequired = true,
}: IsVerifiedPayloadByZodParams): boolean =>
  areAllPropertiesRequired
    ? template.strict().safeParse(payload).success
    : template.strict().partial().safeParse(payload).success;

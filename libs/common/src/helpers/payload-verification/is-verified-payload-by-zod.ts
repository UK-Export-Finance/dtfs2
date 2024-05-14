import { IsVerifiedPayloadbyZodParams } from '../../types/payload-verification';

export const isVerifiedPayloadByZod = ({
  payload,
  template,
  areAllPropertiesRequired = true,
}: IsVerifiedPayloadbyZodParams): boolean => {
  return areAllPropertiesRequired ? template.safeParse(payload).success : template.partial().safeParse(payload).success;
};

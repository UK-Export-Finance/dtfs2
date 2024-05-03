import z from 'zod';

type isVerifiedPayloadParams = {
  payload: unknown;
  template: z.AnyZodObject;
  areAllPropertiesRequired?: boolean;
};

export const isVerifiedPayload = ({
  payload,
  template,
  areAllPropertiesRequired = true,
}: isVerifiedPayloadParams): boolean =>
  areAllPropertiesRequired ? template.safeParse(payload).success : template.partial().safeParse(payload).success;

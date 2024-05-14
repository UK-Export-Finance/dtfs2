import z from 'zod';
import { Prettify } from './types-helper';

type BaseIsVerifiedPayloadParams = {
  payload: Record<string, unknown>;
  areAllPropertiesRequired?: boolean;
};
export type IsVerifiedPayloadByZodParams = Prettify<BaseIsVerifiedPayloadParams & { template: z.AnyZodObject }>;

export type IsVerifiedPayloadByTypeParams = Prettify<
  BaseIsVerifiedPayloadParams & { template: Record<string, string> }
>;

export type IsVerifiedPayloadParams = IsVerifiedPayloadByZodParams | IsVerifiedPayloadByTypeParams;

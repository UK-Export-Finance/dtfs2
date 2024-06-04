import z from 'zod';
import { Prettify } from './types-helper';

type BaseIsVerifiedPayloadParams = {
  payload: Record<string, unknown>;
};
export type IsVerifiedPayloadByZodParams = Prettify<BaseIsVerifiedPayloadParams & { template: z.Schema }>;

export type IsVerifiedPayloadByTypeParams = Prettify<BaseIsVerifiedPayloadParams & { template: Record<string, string> }>;

export type IsVerifiedPayloadParams = IsVerifiedPayloadByZodParams | IsVerifiedPayloadByTypeParams;

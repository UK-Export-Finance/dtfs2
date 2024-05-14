import z from 'zod';
import { Prettify } from './types-helper';

export type TemplateByType = Record<string, string>;

type BaseIsVerifiedPayloadParams = {
  payload: Record<string, unknown>;
  areAllPropertiesRequired?: boolean;
};
export type IsVerifiedPayloadbyZodParams = Prettify<BaseIsVerifiedPayloadParams & { template: z.AnyZodObject }>;

export type IsVerifiedPayloadbyTypeParams = Prettify<BaseIsVerifiedPayloadParams & { template: TemplateByType }>;

export type IsVerifiedPayloadParams = IsVerifiedPayloadbyZodParams | IsVerifiedPayloadbyTypeParams;
import zod from 'zod';
import { Prettify } from './types-helper';
import { AnyObject } from './any-object';

type BaseIsVerifiedPayloadParams = {
  payload: AnyObject;
};
export type IsVerifiedPayloadByZodParams = Prettify<BaseIsVerifiedPayloadParams & { template: zod.Schema }>;

export type IsVerifiedPayloadByTypeParams = Prettify<BaseIsVerifiedPayloadParams & { template: Record<string, string> }>;

export type IsVerifiedPayloadParams = IsVerifiedPayloadByZodParams | IsVerifiedPayloadByTypeParams;

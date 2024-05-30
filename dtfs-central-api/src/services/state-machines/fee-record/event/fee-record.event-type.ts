import { ValuesOf } from '@ukef/dtfs2-common';

export const FEE_RECORD_EVENT_TYPE = {
  ADD_A_PAYMENT: 'ADD_A_PAYMENT',
} as const;

export const FEE_RECORD_EVENT_TYPES = Object.values(FEE_RECORD_EVENT_TYPE);

export type FeeRecordEventType = ValuesOf<typeof FEE_RECORD_EVENT_TYPE>;

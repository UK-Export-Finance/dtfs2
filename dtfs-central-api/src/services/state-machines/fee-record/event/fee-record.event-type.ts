import { ValuesOf } from '@ukef/dtfs2-common';

export const FEE_RECORD_EVENT_TYPE = {
  PAYMENT_ADDED: 'PAYMENT_ADDED',
  PAYMENT_DELETED: 'PAYMENT_DELETED',
  PAYMENT_EDITED: 'PAYMENT_EDITED',
  REMOVE_FROM_PAYMENT: 'REMOVE_FROM_PAYMENT',
} as const;

export const FEE_RECORD_EVENT_TYPES = Object.values(FEE_RECORD_EVENT_TYPE);

export type FeeRecordEventType = ValuesOf<typeof FEE_RECORD_EVENT_TYPE>;

import { ValuesOf } from '@ukef/dtfs2-common';
import { ADD_PAYMENT_ERROR_KEY, GENERATE_KEYING_DATA_ERROR_KEY, INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../constants/premium-payment-tab-error-keys';

export type InitiateRecordCorrectionRequestErrorKey = ValuesOf<typeof INITIATE_RECORD_CORRECTION_ERROR_KEY>;

export type AddPaymentErrorKey = ValuesOf<typeof ADD_PAYMENT_ERROR_KEY>;

export type GenerateKeyingDataErrorKey = ValuesOf<typeof GENERATE_KEYING_DATA_ERROR_KEY>;

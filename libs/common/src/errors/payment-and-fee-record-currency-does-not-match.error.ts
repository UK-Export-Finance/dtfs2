import { ApiError } from './api.error';

export class PaymentAndFeeRecordCurrencyDoesNotMatchError extends ApiError {
  constructor() {
    super({
      status: 400,
      message: 'Payment and fee record currency does not match',
      errorCode: 'PAYMENT_AND_FEE_RECORD_CURRENCY_DOES_NOT_MATCH',
    });
  }
}

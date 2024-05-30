import { ApiError } from './api.error';

export class PaymentHasNoFeeRecordsError extends ApiError {
  constructor() {
    super({
      status: 400,
      message: 'Payment has no fee records',
      errorCode: 'PAYMENT_HAS_NO_FEE_RECORDS_ERROR',
    });
  }
}

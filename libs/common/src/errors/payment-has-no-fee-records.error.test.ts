import { ERROR_CODE } from '../constants';
import { PaymentHasNoFeeRecordsError } from './payment-has-no-fee-records.error';

describe('PaymentHasNoFeeRecordsError', () => {
  it("exposes the 'Payment has no fee records' error message", () => {
    const exception = new PaymentHasNoFeeRecordsError();

    expect(exception.message).toBe('Payment has no fee records');
  });

  it('exposes the name of the exception', () => {
    const exception = new PaymentHasNoFeeRecordsError();

    expect(exception.name).toBe('PaymentHasNoFeeRecordsError');
  });

  it(`exposes the '${ERROR_CODE.PAYMENT_HAS_NO_FEE_RECORDS_ERROR}' error code`, () => {
    const exception = new PaymentHasNoFeeRecordsError();

    expect(exception.errorCode).toBe(ERROR_CODE.PAYMENT_HAS_NO_FEE_RECORDS_ERROR);
  });
});

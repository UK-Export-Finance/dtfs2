import { ERROR_CODE } from '../constants';
import { PaymentAndFeeRecordCurrencyDoesNotMatchError } from './payment-and-fee-record-currency-does-not-match.error';

describe('PaymentAndFeeRecordCurrencyDoesNotMatchError', () => {
  it("exposes the 'Payment and fee record currency does not match' error message", () => {
    const exception = new PaymentAndFeeRecordCurrencyDoesNotMatchError();

    expect(exception.message).toBe('Payment and fee record currency does not match');
  });

  it('exposes the name of the exception', () => {
    const exception = new PaymentAndFeeRecordCurrencyDoesNotMatchError();

    expect(exception.name).toBe('PaymentAndFeeRecordCurrencyDoesNotMatchError');
  });

  it(`exposes the '${ERROR_CODE.PAYMENT_AND_FEE_RECORD_CURRENCY_DOES_NOT_MATCH}' error code`, () => {
    const exception = new PaymentAndFeeRecordCurrencyDoesNotMatchError();

    expect(exception.errorCode).toBe(ERROR_CODE.PAYMENT_AND_FEE_RECORD_CURRENCY_DOES_NOT_MATCH);
  });
});

import { Currency, FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { InvalidPayloadError } from '../../../errors';

export const validateThatRequestedPaymentsMatchSavedPayments = (savedPayments: PaymentEntity[], requestedPaymentIds: number[]) => {
  const savedPaymentIds = savedPayments.map((payment) => payment.id);

  if (!savedPaymentIds.every((id) => requestedPaymentIds.includes(id)) || !requestedPaymentIds.every((id) => savedPaymentIds.includes(id))) {
    throw new InvalidPayloadError('Requested payment IDs do not match saved payment IDs');
  }
};

export const validateThatAllSelectedFeeRecordsAndPaymentGroupHaveSameCurrency = (selectedFeeRecords: FeeRecordEntity[], paymentGroupCurrency: Currency) => {
  const paymentCurrencies = new Set<Currency>();

  selectedFeeRecords.forEach((feeRecord) => {
    const currency = feeRecord.paymentCurrency;
    paymentCurrencies.add(currency);
  });

  if (paymentCurrencies.size > 1) {
    throw new InvalidPayloadError('The selected fee records have mismatched payment currencies.');
  }

  paymentCurrencies.add(paymentGroupCurrency);

  if (paymentCurrencies.size > 1) {
    throw new InvalidPayloadError('The selected fee records payment currency does not match that of the payment group.');
  }
};

export function validateThatPaymentGroupHasFeeRecords(
  paymentGroupFeeRecords: FeeRecordEntity[] | undefined,
): asserts paymentGroupFeeRecords is FeeRecordEntity[] {
  if (!paymentGroupFeeRecords || paymentGroupFeeRecords.length === 0) {
    throw new InvalidPayloadError('The payment group has no fee records.');
  }
}

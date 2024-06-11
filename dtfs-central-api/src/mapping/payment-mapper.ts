import { CurrencyAndAmount, PaymentEntity } from '@ukef/dtfs2-common';
import Big from 'big.js';

/**
 * Maps the payment entity to the payments received
 * @param payment - The payment
 * @returns The payments received
 */
export const mapPaymentEntityToPaymentsReceived = (payment: PaymentEntity): CurrencyAndAmount => ({
  currency: payment.currency,
  amount: payment.amount,
});

/**
 * Maps the payment entities to the total payments received
 * @param payments - The list of payments
 * @returns The total payments received
 */
export const mapPaymentEntitiesToTotalPaymentsReceived = (payments: PaymentEntity[]): CurrencyAndAmount => {
  if (payments.length === 0) {
    throw new Error('Cannot get total payments received for empty payment list');
  }

  const totalPaymentsReceivedAmount = payments.reduce((total, { amount }) => total.add(amount), new Big(0)).toNumber();
  return {
    currency: payments[0].currency,
    amount: totalPaymentsReceivedAmount,
  };
};

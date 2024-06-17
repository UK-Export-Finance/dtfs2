import { CurrencyAndAmount, PaymentEntity } from '@ukef/dtfs2-common';

/**
 * Maps the payment entity to the payments received
 * @param payment - The payment
 * @returns The payments received
 */
export const mapPaymentEntityToCurrencyAndAmount = (payment: PaymentEntity): CurrencyAndAmount => ({
  currency: payment.currency,
  amount: payment.amount,
});

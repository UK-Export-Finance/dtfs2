import { PaymentEntity } from '@ukef/dtfs2-common';
import { PaymentItem } from '../types/utilisation-reports';

/**
 * Maps the payment entity to a payment item
 * @param payment - The payment entity
 * @returns The payment item
 */
export const mapPaymentEntityToPaymentItem = (payment: PaymentEntity): PaymentItem => ({
  id: payment.id,
  currency: payment.currency,
  amount: payment.amount,
});

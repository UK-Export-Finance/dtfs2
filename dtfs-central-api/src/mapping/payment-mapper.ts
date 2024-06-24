import { PaymentEntity } from '@ukef/dtfs2-common';
import { Payment } from '../types/payments';

/**
 * Maps the payment entity to a payment
 * @param payment - The payment entity
 * @returns The payment
 */
export const mapPaymentEntityToPayment = (payment: PaymentEntity): Payment => ({
  id: payment.id,
  currency: payment.currency,
  amount: payment.amount,
  dateReceived: payment.dateReceived,
  reference: payment.reference,
});

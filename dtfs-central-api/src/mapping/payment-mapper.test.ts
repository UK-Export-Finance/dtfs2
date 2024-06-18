import { Currency, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapPaymentEntityToPayment } from './payment-mapper';

describe('payment mapper', () => {
  describe('mapPaymentEntityToPayment', () => {
    it('maps the payment entity currency to the payment currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const paymentEntity = PaymentEntityMockBuilder.forCurrency(paymentCurrency).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.currency).toBe(paymentCurrency);
    });

    it('maps the payment entity amount to the payment amount', () => {
      // Arrange
      const paymentAmount = 100;

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(paymentAmount).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.amount).toBe(paymentAmount);
    });

    it('maps the payment entity id to the payment id', () => {
      // Arrange
      const paymentId = 12;

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.id).toBe(paymentId);
    });
  });
});

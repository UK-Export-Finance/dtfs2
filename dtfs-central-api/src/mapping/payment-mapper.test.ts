import { Currency, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapPaymentEntityToPaymentItem } from './payment-mapper';

describe('payment mapper', () => {
  describe('mapPaymentEntityToPaymentItem', () => {
    it('maps the payment currency to the payment item currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).build();

      // Act
      const paymentItem = mapPaymentEntityToPaymentItem(payment);

      // Assert
      expect(paymentItem.currency).toBe(paymentCurrency);
    });

    it('maps the payment amount to the payment item amount', () => {
      // Arrange
      const paymentAmount = 100;

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(paymentAmount).build();

      // Act
      const paymentItem = mapPaymentEntityToPaymentItem(payment);

      // Assert
      expect(paymentItem.amount).toBe(paymentAmount);
    });

    it('maps the payment id to the payment item id', () => {
      // Arrange
      const paymentId = 12;

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).build();

      // Act
      const paymentItem = mapPaymentEntityToPaymentItem(payment);

      // Assert
      expect(paymentItem.id).toBe(paymentId);
    });
  });
});

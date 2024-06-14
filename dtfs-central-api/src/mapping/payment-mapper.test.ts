import { Currency, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapPaymentEntityToCurrencyAndAmount } from './payment-mapper';

describe('payment mapper', () => {
  describe('mapPaymentEntityToCurrencyAndAmount', () => {
    it('maps the payment currency to the currencyAndAmount currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).build();

      // Act
      const currencyAndAmount = mapPaymentEntityToCurrencyAndAmount(payment);

      // Assert
      expect(currencyAndAmount.currency).toBe(paymentCurrency);
    });

    it('maps the payment amount to the currencyAndAmount amount', () => {
      // Arrange
      const paymentAmount = 100;

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(paymentAmount).build();

      // Act
      const currencyAndAmount = mapPaymentEntityToCurrencyAndAmount(payment);

      // Assert
      expect(currencyAndAmount.amount).toBe(paymentAmount);
    });
  });
});

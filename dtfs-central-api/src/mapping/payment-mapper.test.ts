import { Currency, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapPaymentEntitiesToTotalPaymentsReceived, mapPaymentEntityToPaymentsReceived } from './payment-mapper';

describe('payment mapper', () => {
  describe('mapPaymentEntityToPaymentsReceived', () => {
    it('maps the payment current to the paymentsReceived currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).build();

      // Act
      const paymentsReceived = mapPaymentEntityToPaymentsReceived(payment);

      // Assert
      expect(paymentsReceived.currency).toBe(paymentCurrency);
    });

    it('maps the payment amount to the paymentsReceived amount', () => {
      // Arrange
      const paymentAmount = 100;

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(paymentAmount).build();

      // Act
      const paymentsReceived = mapPaymentEntityToPaymentsReceived(payment);

      // Assert
      expect(paymentsReceived.amount).toBe(paymentAmount);
    });
  });

  describe('mapPaymentEntitiesToTotalPaymentsReceived', () => {
    it('throws an error if the list of payments is empty', () => {
      // Act / Assert
      expect(() => mapPaymentEntitiesToTotalPaymentsReceived([])).toThrow(Error);
    });

    it('maps the payment currency to the totalPaymentsReceived currency', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';

      const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).build()];

      // Act
      const totalReportedPayments = mapPaymentEntitiesToTotalPaymentsReceived(payments);

      // Assert
      expect(totalReportedPayments.currency).toBe(paymentCurrency);
    });

    it('sets the totalPaymentsReceived amount to be the total of the supplied payment amounts', () => {
      // Arrange
      const paymentAmounts = [10, 20, 30];
      const totalPaymentAmount = 60;

      const payments = paymentAmounts.map((amount) => PaymentEntityMockBuilder.forCurrency('GBP').withAmount(amount).build());

      // Act
      const totalReportedPayments = mapPaymentEntitiesToTotalPaymentsReceived(payments);

      // Assert
      expect(totalReportedPayments.amount).toBe(totalPaymentAmount);
    });
  });
});

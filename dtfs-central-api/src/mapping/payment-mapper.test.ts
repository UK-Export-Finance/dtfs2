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
      expect(payment.currency).toEqual(paymentCurrency);
    });

    it('maps the payment entity amount to the payment amount', () => {
      // Arrange
      const paymentAmount = 100;

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(paymentAmount).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.amount).toEqual(paymentAmount);
    });

    it('maps the payment entity id to the payment id', () => {
      // Arrange
      const paymentId = 12;

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.id).toEqual(paymentId);
    });

    it('maps the payment entity dateReceived to the payment dateReceived', () => {
      // Arrange
      const dateReceived = new Date();

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withDateReceived(dateReceived).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.dateReceived).toEqual(dateReceived);
    });

    it('maps the payment entity reference to the payment reference when the reference is defined', () => {
      // Arrange
      const reference = 'A reference';

      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withReference(reference).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.reference).toEqual(reference);
    });

    it('maps the payment entity reference to the payment reference when the reference is not defined', () => {
      // Arrange
      const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withReference(undefined).build();

      // Act
      const payment = mapPaymentEntityToPayment(paymentEntity);

      // Assert
      expect(payment.reference).toBeUndefined();
    });
  });
});

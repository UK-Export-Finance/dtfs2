import { difference } from 'lodash';
import { CURRENCY, FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapToFeeRecordsToKey } from './helpers';
import { aUtilisationReport } from '../../../../../test-helpers';

describe('get-fee-records-to-key.controller helpers', () => {
  describe('mapToFeeRecordsToKey', () => {
    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.MATCH]))(
      "throws an error if at least one of the fee records has the '%s' status",
      (status) => {
        // Arrange
        const feeRecordEntities = [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build()];

        // Act / Assert
        expect(() => mapToFeeRecordsToKey(feeRecordEntities)).toThrow(Error);
      },
    );

    it('maps the fee record id to the fee record to key id', () => {
      // Arrange
      const id = 1;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('MATCH').withId(id).build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].id).toEqual(id);
    });

    it('maps the fee record facilityId to the fee record to key facilityId', () => {
      // Arrange
      const facilityId = '12345678';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('MATCH').withFacilityId(facilityId).build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].facilityId).toEqual(facilityId);
    });

    it('maps the fee record exporter to the fee record to key exporter', () => {
      // Arrange
      const exporter = 'Test exporter';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('MATCH').withExporter(exporter).build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].exporter).toEqual(exporter);
    });

    it('maps the fee record status to the fee record to key status', () => {
      // Arrange
      const status = FEE_RECORD_STATUS.MATCH;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].status).toEqual(status);
    });

    it('maps the fee record fees to the fee record to key reported fees', () => {
      // Arrange
      const amount = 123;
      const currency = CURRENCY.GBP;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withFeesPaidToUkefForThePeriod(amount)
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].reportedFees).toEqual({
        currency,
        amount,
      });
    });

    it('maps the fee record fees to the fee record to key reported payments when the payment currencies match', () => {
      // Arrange
      const amount = 123;
      const currency = CURRENCY.GBP;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withFeesPaidToUkefForThePeriod(amount)
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .withPaymentCurrency(currency)
        .build();

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].reportedPayments).toEqual({
        currency,
        amount,
      });
    });

    it('maps the fee record fees to the fee record to key reported payments when the payment currencies do not match', () => {
      // Arrange
      const amount = 100;
      const paymentCurrency = CURRENCY.GBP;
      const exchangeRate = 1.1;
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('MATCH')
        .withFeesPaidToUkefForThePeriod(amount)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(exchangeRate)
        .build();

      const convertedAmount = 90.91; // 100 / 1.1

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey([feeRecord]);

      // Assert
      expect(feeRecordsToKey[0].reportedPayments).toEqual({
        currency: paymentCurrency,
        amount: convertedAmount,
      });
    });

    it('sets the fee record to key payments received to the reported payments when there are multiple fee records and payments in the group', () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).build(),
      ];

      const utilisationReport = aUtilisationReport();

      const firstFeesPaid = 100;
      const secondFeesPaid = 200;
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(firstFeesPaid)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(secondFeesPaid)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
      ];

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey(feeRecords);

      // Assert
      expect(feeRecordsToKey).toHaveLength(2);

      expect(feeRecordsToKey[0].paymentsReceived).toHaveLength(1);
      expect(feeRecordsToKey[0].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount: firstFeesPaid,
      });

      expect(feeRecordsToKey[1].paymentsReceived).toHaveLength(1);
      expect(feeRecordsToKey[1].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount: secondFeesPaid,
      });
    });

    it('sets the fee record to key payments received to the reported payments when there are multiple fee records and one payment in the group', () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).build()];

      const utilisationReport = aUtilisationReport();

      const firstFeesPaid = 100;
      const secondFeesPaid = 200;
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(firstFeesPaid)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(secondFeesPaid)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
      ];

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey(feeRecords);

      // Assert
      expect(feeRecordsToKey).toHaveLength(2);

      expect(feeRecordsToKey[0].paymentsReceived).toHaveLength(1);
      expect(feeRecordsToKey[0].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount: firstFeesPaid,
      });

      expect(feeRecordsToKey[1].paymentsReceived).toHaveLength(1);
      expect(feeRecordsToKey[1].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount: secondFeesPaid,
      });
    });

    it('sets the fee record to key payments received to the reported payments when there is one fee record and one payment in the group', () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).build()];

      const amount = 100;
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(amount)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
      ];

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey(feeRecords);

      // Assert
      expect(feeRecordsToKey).toHaveLength(1);

      expect(feeRecordsToKey[0].paymentsReceived).toHaveLength(1);
      expect(feeRecordsToKey[0].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount,
      });
    });

    it('sets the fee record to key payments received to the list of payments when there is one fee record and multiple payments in the group', () => {
      // Arrange
      const paymentCurrency = CURRENCY.GBP;

      const firstPaymentAmount = 100;
      const secondPaymentAmount = 123;
      const thirdPaymentAmount = 314.59;
      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(secondPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(thirdPaymentAmount).build(),
      ];

      const amount = 100;
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus('MATCH')
          .withFeesPaidToUkefForThePeriod(amount)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build(),
      ];

      // Act
      const feeRecordsToKey = mapToFeeRecordsToKey(feeRecords);

      // Assert
      expect(feeRecordsToKey).toHaveLength(1);
      expect(feeRecordsToKey[0].paymentsReceived).toHaveLength(3);
      expect(feeRecordsToKey[0].paymentsReceived[0]).toEqual({
        currency: paymentCurrency,
        amount: firstPaymentAmount,
      });
      expect(feeRecordsToKey[0].paymentsReceived[1]).toEqual({
        currency: paymentCurrency,
        amount: secondPaymentAmount,
      });
      expect(feeRecordsToKey[0].paymentsReceived[2]).toEqual({
        currency: paymentCurrency,
        amount: thirdPaymentAmount,
      });
    });
  });
});

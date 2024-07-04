import {
  CURRENCY,
  Currency,
  CurrencyAndAmount,
  FeeRecordEntityMockBuilder,
  KeyingSheetStatus,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  mapFeeRecordEntitiesToKeyingSheet,
  mapFeeRecordEntityToFeeRecord,
  mapFeeRecordEntityToReportedFees,
  mapFeeRecordEntityToReportedPayments,
} from './fee-record-mapper';
import { KeyingSheetAdjustment } from '../types/fee-records';

describe('fee record mapper', () => {
  describe('mapFeeRecordEntityToReportedFees', () => {
    it('maps fees paid to ukef for the period currency to the reported fee currency', () => {
      // Arrange
      const currency = CURRENCY.JPY;
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriodCurrency(currency)
        .build();

      // Act
      const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Assert
      expect(reportedFees.currency).toEqual(currency);
    });

    it('maps fees paid to ukef for the period to the reported fee amount', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123456.78)
        .build();

      // Act
      const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);

      // Assert
      expect(reportedFees.amount).toEqual(123456.78);
    });
  });

  describe('mapFeeRecordEntityToReportedPayments', () => {
    it('maps payment currency to reported payment currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriodCurrency('JPY')
        .withPaymentCurrency('EUR')
        .build();

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.currency).toEqual('EUR');
    });

    it('maps fees paid to ukef for the period to the reported payment amount when payment currency matches fees paid to ukef for the period currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123456.78)
        .withFeesPaidToUkefForThePeriodCurrency('JPY')
        .withPaymentCurrency('JPY')
        .build();

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.amount).toEqual(123456.78);
    });

    it('converts fees paid to ukef for the period to the payment currency and maps to amount when payment currency does not match fees paid to ukef for the period currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(123.45)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('JPY')
        .withPaymentExchangeRate(0.0059)
        .build();
      /**
       * expected amount = feesPaidToUkefForThePeriod / paymentExchangeRate
       *                 = 123.45 / 0.0059
       *                 = 20923.73 (rounded to two decimal places)
       *  */
      const expectedReportedPaymentAmount = 20923.73;

      // Act
      const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

      // Assert
      expect(reportedPayments.amount).toEqual(expectedReportedPaymentAmount);
    });
  });

  describe('mapFeeRecordEntityToFeeRecord', () => {
    it('maps the fee record entity id to the fee record id', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(10).build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.id).toBe(10);
    });

    it('maps the fee record entity facility id to the fee record facilityId', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId('27182818').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.facilityId).toBe('27182818');
    });

    it('maps the fee record entity exporter to the fee record exporter', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withExporter('Test exporter').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.exporter).toBe('Test exporter');
    });

    it('maps the fee record entity fees paid currency to the fee record reported fees currency', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFeesPaidToUkefForThePeriodCurrency('EUR').build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.reportedFees.currency).toBe('EUR');
    });

    it('maps the fee record entity fees paid to the fee record reported fees amount', () => {
      // Arrange
      const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFeesPaidToUkefForThePeriod(314.59).build();

      // Act
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

      // Assert
      expect(feeRecord.reportedFees.amount).toBe(314.59);
    });

    describe('when the fee record entity payment currency matches the fees paid currency', () => {
      const currency: Currency = 'EUR';

      it('maps the fee record entity fees paid currency to the fee record reported payments currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(currency)
          .withPaymentCurrency(currency)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.currency).toBe('EUR');
      });

      it('maps the fee record entity fees paid to the fee record reported payment amount', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(currency)
          .withPaymentCurrency(currency)
          .withFeesPaidToUkefForThePeriod(314.59)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.amount).toBe(314.59);
      });
    });

    describe('when the fee record entity payment currency does not match the fees paid currency', () => {
      const feesPaidCurrency: Currency = 'EUR';
      const paymentCurrency: Currency = 'GBP';

      const paymentExchangeRate = 1.1;

      const feesPaidAmount = 100;
      const feesPaidInPaymentCurrencyAmount = 90.91; // 100 / 1.1

      it('maps the fee record entity payment currency to the fee record reported payments currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
          .withFeesPaidToUkefForThePeriod(feesPaidAmount)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.currency).toBe(paymentCurrency);
      });

      it('maps the fee record entity fees paid to the fee record reported payment amount in the payment currency', () => {
        // Arrange
        const feeRecordEntity = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidCurrency)
          .withFeesPaidToUkefForThePeriod(feesPaidAmount)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .build();

        // Act
        const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntity);

        // Assert
        expect(feeRecord.reportedPayments.amount).toBe(feesPaidInPaymentCurrencyAmount);
      });
    });
  });

  describe('mapFeeRecordEntitiesToKeyingSheet', () => {
    it('returns keying sheet entries only for the fee records which have the READY_TO_KEY or RECONCILED status', () => {
      // Arrange
      const report = aUtilisationReport();
      const payment = aPayment();
      const feeRecordEntities = [
        FeeRecordEntityMockBuilder.forReport(report).withPayments([payment]).withExporter('Test exporter 1').withStatus('DOES_NOT_MATCH').build(), // not included
        FeeRecordEntityMockBuilder.forReport(report).withPayments([payment]).withExporter('Test exporter 2').withStatus('MATCH').build(), // not included
        FeeRecordEntityMockBuilder.forReport(report).withPayments([payment]).withExporter('Test exporter 3').withStatus('READY_TO_KEY').build(), // included
        FeeRecordEntityMockBuilder.forReport(report).withPayments([payment]).withExporter('Test exporter 4').withStatus('RECONCILED').build(), // included
        FeeRecordEntityMockBuilder.forReport(report).withPayments([payment]).withExporter('Test exporter 5').withStatus('TO_DO').build(), // not included
      ];

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet(feeRecordEntities);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].exporter).toBe('Test exporter 3');
      expect(result[1].exporter).toBe('Test exporter 4');
    });

    it('maps the fee record entity id, facility id, exporter and base currency', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('READY_TO_KEY')
        .withId(123)
        .withFacilityId('12345678')
        .withExporter('Test exporter')
        .withPayments([aPayment()])
        .withBaseCurrency('EUR')
        .build();

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].feeRecordId).toBe(feeRecord.id);
      expect(result[0].facilityId).toBe(feeRecord.facilityId);
      expect(result[0].exporter).toBe(feeRecord.exporter);
      expect(result[0].baseCurrency).toBe(feeRecord.baseCurrency);
    });

    it('sets the first attached payment date received to the keying sheet datePaymentReceived', () => {
      // Arrange
      const payments = [
        PaymentEntityMockBuilder.forCurrency('GBP').withDateReceived(new Date('2023-12')).build(),
        PaymentEntityMockBuilder.forCurrency('GBP').withDateReceived(new Date('2024-12')).build(),
      ];
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPayments(payments).build();

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].datePaymentReceived).toEqual(new Date('2023-12'));
    });

    it('maps the fee record READY_TO_KEY status to the keying sheet TO_DO status', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withPayments([aPayment()]).withStatus('READY_TO_KEY').build();

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe<KeyingSheetStatus>('TO_DO');
    });

    it('maps the fee record RECONCILED status to the keying sheet DONE status', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withPayments([aPayment()]).withStatus('RECONCILED').build();

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe<KeyingSheetStatus>('DONE');
    });

    it.each([
      { adjustmentField: 'fixedFeeAdjustment' },
      { adjustmentField: 'premiumAccrualBalanceAdjustment' },
      { adjustmentField: 'principalBalanceAdjustment' },
    ] as const)(
      "sets to the '$adjustmentField' keying sheet amount and change to 'INCREASE' when the fee record '$adjustmentField' is a positive number",
      ({ adjustmentField }) => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPayments([aPayment()]).build();
        feeRecord[adjustmentField] = 100;

        // Act
        const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0][adjustmentField]).toEqual<KeyingSheetAdjustment>({
          amount: 100,
          change: 'INCREASE',
        });
      },
    );

    it.each([
      { adjustmentField: 'fixedFeeAdjustment' },
      { adjustmentField: 'premiumAccrualBalanceAdjustment' },
      { adjustmentField: 'principalBalanceAdjustment' },
    ] as const)(
      "sets to the '$adjustmentField' keying sheet amount to the positive amount and change to 'DECREASE' when the fee record '$adjustmentField' is a negative number",
      ({ adjustmentField }) => {
        // Arrange
        const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPayments([aPayment()]).build();
        feeRecord[adjustmentField] = -100;

        // Act
        const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0][adjustmentField]).toEqual<KeyingSheetAdjustment>({
          amount: 100,
          change: 'DECREASE',
        });
      },
    );

    it.each([
      { adjustmentField: 'fixedFeeAdjustment' },
      { adjustmentField: 'premiumAccrualBalanceAdjustment' },
      { adjustmentField: 'principalBalanceAdjustment' },
    ] as const)("sets to the '$adjustmentField' keying sheet to null when the fee record '$adjustmentField' is null", ({ adjustmentField }) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPayments([aPayment()]).build();
      feeRecord[adjustmentField] = null;

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0][adjustmentField]).toBeNull();
    });

    it('sets the keying sheet feePayment to the fee record reported fees', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus('READY_TO_KEY')
        .withPayments([aPayment()])
        .withFeesPaidToUkefForThePeriod(100)
        .withFeesPaidToUkefForThePeriodCurrency('GBP')
        .withPaymentCurrency('GBP')
        .build();

      // Act
      const result = mapFeeRecordEntitiesToKeyingSheet([feeRecord]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].feePayment).toEqual<CurrencyAndAmount>({
        currency: 'GBP',
        amount: 100,
      });
    });
  });

  function aUtilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }

  function aPayment(): PaymentEntity {
    return PaymentEntityMockBuilder.forCurrency('GBP').build();
  }
});

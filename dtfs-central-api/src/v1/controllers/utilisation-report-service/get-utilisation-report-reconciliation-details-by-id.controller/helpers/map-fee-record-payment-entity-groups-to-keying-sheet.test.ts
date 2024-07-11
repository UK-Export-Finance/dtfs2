import { difference } from 'lodash';
import {
  Currency,
  CurrencyAndAmount,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapFeeRecordPaymentEntityGroupsToKeyingSheet } from './map-fee-record-payment-entity-groups-to-keying-sheet';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('mapFeeRecordPaymentEntityGroupsToKeyingSheet', () => {
    const paymentCurrency: Currency = 'GBP';

    const VALID_FEE_RECORD_STATUSES = [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED];

    it.each(VALID_FEE_RECORD_STATUSES)('returns a keying sheet entry for a group where the fee record status is %s', (status) => {
      // Arrange
      const feeRecords = [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build()];

      const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments: [aPayment()] }];

      // Act
      const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

      // Assert
      expect(result).toHaveLength(1);
    });

    it.each(difference(Object.values(FEE_RECORD_STATUS), VALID_FEE_RECORD_STATUSES))(
      'does not return a keying sheet entry for a group where the fee record status is %s',
      (status) => {
        // Arrange
        const feeRecords = [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build()];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments: [aPayment()] }];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(result).toHaveLength(0);
      },
    );

    it('maps the fee record id, facility id, exporter and base currency to the keying sheet', () => {
      // Arrange
      const aFeeRecordWithIdFacilityIdExporterAndBaseCurrency = (id: number, facilityId: string, exporter: string, baseCurrency: Currency) =>
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withId(id)
          .withFacilityId(facilityId)
          .withExporter(exporter)
          .withBaseCurrency(baseCurrency)
          .build();

      const firstGroupFeeRecords = [
        aFeeRecordWithIdFacilityIdExporterAndBaseCurrency(1, '11111111', 'Test exporter 1', paymentCurrency),
        aFeeRecordWithIdFacilityIdExporterAndBaseCurrency(2, '22222222', 'Test exporter 2', paymentCurrency),
        aFeeRecordWithIdFacilityIdExporterAndBaseCurrency(3, '33333333', 'Test exporter 3', paymentCurrency),
      ];

      const secondGroupFeeRecords = [aFeeRecordWithIdFacilityIdExporterAndBaseCurrency(5, '55555555', 'Test exporter 5', paymentCurrency)];

      const thirdGroupFeeRecords = [aFeeRecordWithIdFacilityIdExporterAndBaseCurrency(4, '44444444', 'Test exporter 4', paymentCurrency)];

      const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [
        { payments: [aPayment()], feeRecords: firstGroupFeeRecords },
        { payments: [aPayment()], feeRecords: secondGroupFeeRecords },
        { payments: [aPayment()], feeRecords: thirdGroupFeeRecords },
      ];

      // Act
      const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

      // Assert
      const allFeeRecords = [...firstGroupFeeRecords, ...secondGroupFeeRecords, ...thirdGroupFeeRecords];
      result.forEach((keyingSheetItem, index) => {
        expect(keyingSheetItem.feeRecordId).toBe(allFeeRecords[index].id);
        expect(keyingSheetItem.facilityId).toBe(allFeeRecords[index].facilityId);
        expect(keyingSheetItem.exporter).toBe(allFeeRecords[index].exporter);
        expect(keyingSheetItem.baseCurrency).toBe(allFeeRecords[index].baseCurrency);
      });
    });

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: null },
      { condition: 'is zero', value: 0, expectedMappedValue: { amount: 0, change: 'NONE' } },
      { condition: 'is positive', value: 100, expectedMappedValue: { amount: 100, change: 'INCREASE' } },
      { condition: 'is negative', value: -100, expectedMappedValue: { amount: 100, change: 'DECREASE' } },
    ])(
      'sets the keying sheet fixedFeeAdjustment to $expectedMappedValue when the fee record entity fixedFeeAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const feeRecords = [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withFixedFeeAdjustment(value).build()];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments: [aPayment()] }];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].fixedFeeAdjustment).toEqual(expectedMappedValue);
      },
    );

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: null },
      { condition: 'is zero', value: 0, expectedMappedValue: { amount: 0, change: 'NONE' } },
      { condition: 'is positive', value: 100, expectedMappedValue: { amount: 100, change: 'INCREASE' } },
      { condition: 'is negative', value: -100, expectedMappedValue: { amount: 100, change: 'DECREASE' } },
    ])(
      'sets the keying sheet premiumAccrualBalanceAdjustment to $expectedMappedValue when the fee record entity premiumAccrualBalanceAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPremiumAccrualBalanceAdjustment(value).build(),
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments: [aPayment()] }];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].premiumAccrualBalanceAdjustment).toEqual(expectedMappedValue);
      },
    );

    it.each([
      { condition: 'is null', value: null, expectedMappedValue: null },
      { condition: 'is zero', value: 0, expectedMappedValue: { amount: 0, change: 'NONE' } },
      { condition: 'is positive', value: 100, expectedMappedValue: { amount: 100, change: 'INCREASE' } },
      { condition: 'is negative', value: -100, expectedMappedValue: { amount: 100, change: 'DECREASE' } },
    ])(
      'sets the keying sheet principalBalanceAdjustment to $expectedMappedValue when the fee record entity principalBalanceAdjustment $condition',
      ({ value, expectedMappedValue }) => {
        // Arrange
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPrincipalBalanceAdjustment(value).build(),
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments: [aPayment()] }];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].principalBalanceAdjustment).toEqual(expectedMappedValue);
      },
    );

    describe('when there is one fee record with many payments in the group', () => {
      const aFeeRecordPaymentGroupForPayments = (paymentEntities: PaymentEntity[]): FeeRecordPaymentEntityGroup => ({
        feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build()],
        payments: paymentEntities,
      });

      it('sets the keying sheet fee payments to a list of the payment currency, amount and dateReceived fields in the group', () => {
        // Arrange
        const payments = [
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(111.11).withDateReceived(new Date('2021-01-01')).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(222.22).withDateReceived(new Date('2022-02-02')).build(),
          PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(333.33).withDateReceived(new Date('2023-03-03')).build(),
        ];

        const feeRecordPaymentGroup = aFeeRecordPaymentGroupForPayments(payments);

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet([feeRecordPaymentGroup]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].feePayments).toHaveLength(3);
        expect(result[0].feePayments[0]).toEqual({ currency: paymentCurrency, amount: 111.11, dateReceived: new Date('2021-01-01') });
        expect(result[0].feePayments[1]).toEqual({ currency: paymentCurrency, amount: 222.22, dateReceived: new Date('2022-02-02') });
        expect(result[0].feePayments[2]).toEqual({ currency: paymentCurrency, amount: 333.33, dateReceived: new Date('2023-03-03') });
      });
    });

    describe('when there is one payment with many fee records in the group', () => {
      it('returns as many keying sheet entries as there are fee records in each of the groups', () => {
        // Arrange
        const firstFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
        ];
        const secondFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [
          { feeRecords: firstFeeRecords, payments: [aPayment()] },
          { feeRecords: secondFeeRecords, payments: [aPayment()] },
        ];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(result).toHaveLength(firstFeeRecords.length + secondFeeRecords.length);
      });

      it('sets the keying sheet fee payments to a list of the fee record reported payments currency and amount and the payment dateReceived field in the group', () => {
        // Arrange
        const aFeeRecordWithReportedPayments = (reportedPayments: CurrencyAndAmount) =>
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
            .withStatus('READY_TO_KEY')
            .withFeesPaidToUkefForThePeriod(reportedPayments.amount)
            .withFeesPaidToUkefForThePeriodCurrency(reportedPayments.currency)
            .withPaymentCurrency(reportedPayments.currency)
            .build();

        const feeRecords = [
          aFeeRecordWithReportedPayments({ currency: paymentCurrency, amount: 111.11 }),
          aFeeRecordWithReportedPayments({ currency: paymentCurrency, amount: 222.22 }),
          aFeeRecordWithReportedPayments({ currency: paymentCurrency, amount: 333.33 }),
        ];

        const dateReceived = new Date('2023-03-03');
        const payments = [PaymentEntityMockBuilder.forCurrency(paymentCurrency).withDateReceived(dateReceived).build()];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet([{ feeRecords, payments }]);

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].feePayments).toHaveLength(1);
        expect(result[0].feePayments[0]).toEqual({ currency: paymentCurrency, amount: 111.11, dateReceived });
        expect(result[1].feePayments).toHaveLength(1);
        expect(result[1].feePayments[0]).toEqual({ currency: paymentCurrency, amount: 222.22, dateReceived });
        expect(result[2].feePayments).toHaveLength(1);
        expect(result[2].feePayments[0]).toEqual({ currency: paymentCurrency, amount: 333.33, dateReceived });
      });
    });

    function aUtilisationReport() {
      return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    }

    function aPayment() {
      return PaymentEntityMockBuilder.forCurrency(paymentCurrency).build();
    }
  });
});

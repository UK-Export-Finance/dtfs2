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
import { KeyingSheetRow } from '../../../../../types/fee-records';

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
      result.forEach((keyingSheetRow, index) => {
        expect(keyingSheetRow.feeRecordId).toBe(allFeeRecords[index].id);
        expect(keyingSheetRow.facilityId).toBe(allFeeRecords[index].facilityId);
        expect(keyingSheetRow.exporter).toBe(allFeeRecords[index].exporter);
        expect(keyingSheetRow.baseCurrency).toBe(allFeeRecords[index].baseCurrency);
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

    describe('when there is one fee record with zero payments in the group', () => {
      it('maps the group to a keying sheet row with a fee payment with no date received and amount zero', () => {
        // Arrange
        const feeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').withPaymentCurrency('GBP').build()],
          payments: [],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToKeyingSheet([feeRecordPaymentGroup]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].feePayments).toHaveLength(1);
        expect(result[0].feePayments[0].currency).toBe<Currency>('GBP');
        expect(result[0].feePayments[0].amount).toBe(0);
        expect(result[0].feePayments[0].dateReceived).toBe(null);
      });
    });

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

    describe('when there are many fee records with many payments', () => {
      const aFeeRecordWithPaymentAmount = (amount: number) =>
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus('READY_TO_KEY')
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(amount)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .build();

      const aPaymentWithAmountAndDateReceived = (amount: number, dateReceived: Date) =>
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(amount).withDateReceived(dateReceived).build();

      it('returns as many keying sheet rows as there are fee records', () => {
        // Arrange
        const feeRecords = [
          aFeeRecordWithPaymentAmount(100),
          aFeeRecordWithPaymentAmount(100),
          aFeeRecordWithPaymentAmount(100),
          aFeeRecordWithPaymentAmount(100),
          aFeeRecordWithPaymentAmount(100),
        ];

        const payments = [
          aPaymentWithAmountAndDateReceived(300, new Date('2024-01-01')),
          aPaymentWithAmountAndDateReceived(100, new Date('2024-01-01')),
          aPaymentWithAmountAndDateReceived(100, new Date('2024-01-01')),
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments }];

        // Act
        const keyingSheet = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(keyingSheet).toHaveLength(5);
      });

      it('returns a keying sheet sorted descended by fee record amount with a single payment assigned to a single fee record of the same amount when the amounts line up one-to-one', () => {
        // Arrange
        const feeRecords = [aFeeRecordWithPaymentAmount(111.11), aFeeRecordWithPaymentAmount(333.33), aFeeRecordWithPaymentAmount(222.22)];

        const payments = [
          aPaymentWithAmountAndDateReceived(333.33, new Date('2023-01-01')),
          aPaymentWithAmountAndDateReceived(111.11, new Date('2021-01-01')),
          aPaymentWithAmountAndDateReceived(222.22, new Date('2022-01-01')),
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments }];

        // Act
        const keyingSheet = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(keyingSheet).toHaveLength(3);
        expect(keyingSheet[0].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2023-01-01'), amount: 333.33, currency: paymentCurrency },
        ]);
        expect(keyingSheet[1].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2022-01-01'), amount: 222.22, currency: paymentCurrency },
        ]);
        expect(keyingSheet[2].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2021-01-01'), amount: 111.11, currency: paymentCurrency },
        ]);
      });

      it('returns a keying sheet sorted descending by fee record amount with payments greedily split across the fee records when the amounts do not line up', () => {
        // Arrange
        /**
         * Total fee record amount = 1,666.65
         */
        const feeRecords = [
          aFeeRecordWithPaymentAmount(111.11),
          aFeeRecordWithPaymentAmount(555.55),
          aFeeRecordWithPaymentAmount(333.33),
          aFeeRecordWithPaymentAmount(444.44),
          aFeeRecordWithPaymentAmount(222.22),
        ];

        const payments = [
          aPaymentWithAmountAndDateReceived(66.65, new Date('2022-01-01')), // Payment A
          aPaymentWithAmountAndDateReceived(1000, new Date('2024-01-01')), // Payment B
          aPaymentWithAmountAndDateReceived(600, new Date('2023-01-01')), // Payment C
        ];

        const feeRecordPaymentGroups: FeeRecordPaymentEntityGroup[] = [{ feeRecords, payments }];

        // Act
        const keyingSheet = mapFeeRecordPaymentEntityGroupsToKeyingSheet(feeRecordPaymentGroups);

        // Assert
        expect(keyingSheet).toHaveLength(5);
        // First fee record (555.55) - takes 555.55 from payment B (payment B now has 444.45)
        expect(keyingSheet[0].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2024-01-01'), amount: 555.55, currency: paymentCurrency },
        ]);
        // Second fee record (444.44) - takes 444.44 from payment C (payment C now has 155.56)
        expect(keyingSheet[1].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2023-01-01'), amount: 444.44, currency: paymentCurrency },
        ]);
        // Third fee record (333.33) - takes 333.33 from payment B (payment B now has 111.12)
        expect(keyingSheet[2].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2024-01-01'), amount: 333.33, currency: paymentCurrency },
        ]);
        // Fourth fee record (222.22) - takes 155.56 from payment C (payment C now has 0) and 66.66 from payment B (payment B now has 44.46)
        expect(keyingSheet[3].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2023-01-01'), amount: 155.56, currency: paymentCurrency },
          { dateReceived: new Date('2024-01-01'), amount: 66.66, currency: paymentCurrency },
        ]);
        // Fifth fee record (111.11) - takes 66.65 from payment A (payment A now has 0) and 44.46 from payment B (payment B now has 0)
        expect(keyingSheet[4].feePayments).toEqual<KeyingSheetRow['feePayments']>([
          { dateReceived: new Date('2022-01-01'), amount: 66.65, currency: paymentCurrency },
          { dateReceived: new Date('2024-01-01'), amount: 44.46, currency: paymentCurrency },
        ]);
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

import { Currency, FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, FeeRecordStatus, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from './map-fee-record-payment-entity-groups-to-fee-record-payment-groups';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';
import { aUtilisationReport } from '../../../../../../test-helpers';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups', () => {
    describe('when a group has a single fee record with no payments', () => {
      const currency: Currency = 'GBP';
      const amount = 100;

      const createFeeRecordEntityPaymentGroupForSingleFeeRecord = (id: number, status: FeeRecordStatus): FeeRecordPaymentEntityGroup => ({
        feeRecords: [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
            .withId(id)
            .withStatus(status)
            .withFeesPaidToUkefForThePeriod(amount)
            .withFeesPaidToUkefForThePeriodCurrency(currency)
            .withPaymentCurrency(currency)
            .build(),
        ],
        payments: [],
      });

      it('returns as many fee record payment groups as there are fee record payment entity groups', () => {
        // Arrange
        const groups = [
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, 'TO_DO'),
        ];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result).toHaveLength(groups.length);
      });

      it('sets the feeRecordPaymentGroup status to the status of the fee record at the same index', () => {
        // Arrange
        const groups = [
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, 'MATCH'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, 'DOES_NOT_MATCH'),
        ];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        result.forEach((group, index) => {
          expect(group.status).toBe(groups[index].feeRecords[0].status);
        });
      });

      it('sets the totalReportedPayments to the same value as the fee record reported payments', () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].totalReportedPayments).toEqual({ currency, amount });
      });

      it('sets the paymentsReceived to null', () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].paymentsReceived).toBeNull();
      });

      it('sets the totalPaymentsReceived to null', () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].totalPaymentsReceived).toBeNull();
      });
    });

    describe('when a group has a multiple fee records and payments', () => {
      it('returns only one fee record payment group', () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').withAmount(200).build(), PaymentEntityMockBuilder.forCurrency('GBP').withAmount(300).build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
      });

      it('sets the status to ready to key if any of the fee records have status ready to key', () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('RECONCILED').build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe<FeeRecordStatus>('READY_TO_KEY');
      });

      it.each(Object.values(FEE_RECORD_STATUS))('sets the status to the status of the fee records when they all have status %s', (status: FeeRecordStatus) => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe(status);
      });

      it('returns the group with as many fee records as there are fee records in the supplied group', () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].feeRecords).toHaveLength(2);
      });

      it('sets the totalReportedPayments to the total of the fee record reported payments', () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriod(100)
          .withFeesPaidToUkefForThePeriodCurrency('GBP')
          .withPaymentCurrency('GBP')
          .build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withFeesPaidToUkefForThePeriod(400)
          .withFeesPaidToUkefForThePeriodCurrency('JPY')
          .withPaymentCurrency('GBP')
          .withPaymentExchangeRate(2)
          .build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').withAmount(5000000).build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        // 100 + 400 / 2 = 100 + 200 = 300
        const expectedTotalReportedPaymentAmount = 300;
        expect(result[0].totalReportedPayments).toEqual({ currency: 'GBP', amount: expectedTotalReportedPaymentAmount });
      });

      it('returns the group with as many paymentsReceived as there are payments in the supplied group', () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build(), PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].paymentsReceived).toHaveLength(2);
      });

      it('sets the totalPaymentsReceived to the total of the payment amounts', () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').withAmount(200).build(), PaymentEntityMockBuilder.forCurrency('GBP').withAmount(300).build()],
        };

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].totalPaymentsReceived).toEqual({ currency: 'GBP', amount: 500 });
      });
    });
  });
});

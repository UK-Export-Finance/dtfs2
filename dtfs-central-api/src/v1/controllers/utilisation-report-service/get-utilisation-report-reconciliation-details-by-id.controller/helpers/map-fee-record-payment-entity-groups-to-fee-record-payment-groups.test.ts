import {
  Currency,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from './map-fee-record-payment-entity-groups-to-fee-record-payment-groups';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';

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
      const paymentCurrency: Currency = 'GBP';
      const paymentAmount = 100;

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(paymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(paymentAmount).build(),
      ];
      const totalPaymentsReceivedAmount = paymentAmount * payments.length;

      const feeRecordStatus: FeeRecordStatus = 'DOES_NOT_MATCH';

      const createFeeRecordEntity = (id: number, facilityId: string, exporter: string): FeeRecordEntity =>
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withId(id)
          .withStatus(feeRecordStatus)
          .withFacilityId(facilityId)
          .withExporter(exporter)
          .withFeesPaidToUkefForThePeriod(paymentAmount)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withPaymentCurrency(paymentCurrency)
          .withPayments(payments)
          .build();

      const feeRecordEntities = [
        createFeeRecordEntity(1, '12345678', 'Test exporter 1'),
        createFeeRecordEntity(2, '87654321', 'Test exporter 2'),
        createFeeRecordEntity(3, '10203040', 'Test exporter 3'),
      ];
      const totalReportedPaymentsAmount = paymentAmount * feeRecordEntities.length;

      const createFeeRecordEntityPaymentGroup = (): FeeRecordPaymentEntityGroup => ({
        feeRecords: feeRecordEntities,
        payments,
      });

      it('returns only one fee record payment group', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
      });

      it('sets the status to the status of the fee record', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe(feeRecordStatus);
      });

      it('returns the group with as many fee records as there are fee records in the supplied group', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].feeRecords).toHaveLength(feeRecordEntities.length);
      });

      it('sets the totalReportedPayments to the total of the fee record reported payments', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].totalReportedPayments).toEqual({ currency: paymentCurrency, amount: totalReportedPaymentsAmount });
      });

      it('returns the group with as many paymentsReceived as there are payments in the supplied group', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].paymentsReceived).toHaveLength(group.payments.length);
      });

      it('sets the totalPaymentsReceived to the total of the payment amounts', () => {
        // Arrange
        const group = createFeeRecordEntityPaymentGroup();

        // Act
        const result = mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].totalPaymentsReceived).toEqual({ currency: paymentCurrency, amount: totalPaymentsReceivedAmount });
      });
    });

    function aUtilisationReport(): UtilisationReportEntity {
      return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    }
  });
});

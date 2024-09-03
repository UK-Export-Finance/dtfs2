import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getFeeRecordPaymentEntityGroups } from './get-fee-record-payment-entity-groups';

describe('getFeeRecordPaymentEntityGroups', () => {
  it('should return all the fee records as individual groups when there are no payments', () => {
    // Arrange
    const report = utilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).build(),
    ];

    // Act
    const groups = getFeeRecordPaymentEntityGroups(feeRecords);

    // Assert
    expect(groups).toHaveLength(feeRecords.length);
    groups.forEach((group, index) => {
      expect(group.feeRecords).toHaveLength(1);
      expect(group.feeRecords[0].id).toEqual(feeRecords[index].id);
      expect(group.payments).toHaveLength(0);
    });
  });

  it('should create one group when all fee records have the same attached payments', () => {
    // Arrange
    const report = utilisationReport();

    const payments = [
      PaymentEntityMockBuilder.forCurrency('GBP').withId(1).build(),
      PaymentEntityMockBuilder.forCurrency('GBP').withId(2).build(),
      PaymentEntityMockBuilder.forCurrency('GBP').withId(3).build(),
    ];

    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withPayments(payments).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withPayments(payments).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withPayments(payments).build(),
    ];

    // Act
    const groups = getFeeRecordPaymentEntityGroups(feeRecords);

    // Assert
    expect(groups).toHaveLength(1);
    expect(groups[0].feeRecords).toEqual(feeRecords);
    expect(groups[0].payments).toEqual(payments);
  });

  it('groups the fee records based on which payments they share', () => {
    // Arrange
    const report = utilisationReport();

    const firstPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(1).build(), PaymentEntityMockBuilder.forCurrency('GBP').withId(3).build()];

    const secondPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(2).build()];

    const firstFeeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withPayments(firstPayments).build()];

    const secondFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withPayments(secondPayments).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withPayments(secondPayments).build(),
    ];

    // Act
    const groups = getFeeRecordPaymentEntityGroups([...firstFeeRecords, ...secondFeeRecords]);

    // Assert
    expect(groups).toHaveLength(2);

    expect(groups[0].feeRecords).toEqual(firstFeeRecords);
    expect(groups[0].payments).toEqual(firstPayments);

    expect(groups[1].feeRecords).toEqual(secondFeeRecords);
    expect(groups[1].payments).toEqual(secondPayments);
  });

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});

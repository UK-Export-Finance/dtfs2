import { FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getFeeRecordPaymentEntityGroupStatus } from './get-fee-record-payment-entity-group-status';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';

describe('getFeeRecordPaymentEntityGroupStatus', () => {
  it('throws an error when the group has an empty list of fee records', () => {
    // Arrange
    const group: FeeRecordPaymentEntityGroup = {
      feeRecords: [],
      payments: [],
    };

    // Act / Assert
    expect(() => getFeeRecordPaymentEntityGroupStatus(group)).toThrow(new Error('Fee record payment entity group cannot have an empty fee records array'));
  });

  it.each(Object.values(FEE_RECORD_STATUS))('returns the group status when each fee record in the group has status %s', (status) => {
    // Arrange
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    // Act
    const result = getFeeRecordPaymentEntityGroupStatus(group);

    // Assert
    expect(result).toEqual(status);
  });

  it(`returns the status ${FEE_RECORD_STATUS.READY_TO_KEY} when the fee records in the group have both the ${FEE_RECORD_STATUS.READY_TO_KEY} and ${FEE_RECORD_STATUS.RECONCILED} status`, () => {
    // Arrange
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.RECONCILED).build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    // Act
    const result = getFeeRecordPaymentEntityGroupStatus(group);

    // Assert
    expect(result).toEqual(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  it.each([FEE_RECORD_STATUS.TO_DO, FEE_RECORD_STATUS.DOES_NOT_MATCH, FEE_RECORD_STATUS.MATCH])(
    'throws an error when all the fee records in the group have status %s expect for one',
    (status) => {
      // Arrange
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build(),
      ];
      const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

      // Act / Assert
      expect(() => getFeeRecordPaymentEntityGroupStatus(group)).toThrow(
        new Error(`Fee record payment entity group has an invalid set of statuses: [${status}, ${FEE_RECORD_STATUS.READY_TO_KEY}]`),
      );
    },
  );

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});

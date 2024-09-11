import { difference } from 'lodash';
import { when } from 'jest-when';
import { FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getFeeRecordPaymentEntityGroupReconciliationData } from './get-fee-record-payment-entity-group-reconciliation-data';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';
import { TfmUsersRepo } from '../repositories/tfm-users-repo';
import { aTfmUser } from '../../test-helpers';

describe('getFeeRecordPaymentEntityGroupReconciliationData', () => {
  const findTfmUserSpy = jest.spyOn(TfmUsersRepo, 'findOneUserById');

  beforeEach(() => {
    findTfmUserSpy.mockRejectedValue('Some error');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws an error when the group has an empty list of fee records', async () => {
    // Arrange
    const group: FeeRecordPaymentEntityGroup = {
      feeRecords: [],
      payments: [],
    };

    // Act / Assert
    await expect(getFeeRecordPaymentEntityGroupReconciliationData(group)).rejects.toThrow(
      new Error('Fee record payment entity group cannot have an empty fee records array'),
    );
  });

  it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.RECONCILED]))(
    'returns an empty object if all the fee records in the group have status %s',
    async (status) => {
      // Arrange
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(status).build(),
      ];
      const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

      // Act
      const result = await getFeeRecordPaymentEntityGroupReconciliationData(group);

      // Assert
      expect(result).toEqual({});
    },
  );

  it(`throws an error if any of the fee records in the group with the ${FEE_RECORD_STATUS.RECONCILED} status have a null 'dateReconciled' property`, async () => {
    // Arrange
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.READY_TO_KEY).withDateReconciled(null).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.RECONCILED).withDateReconciled(new Date('2024')).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.RECONCILED).withDateReconciled(new Date('2023')).build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport()).withStatus(FEE_RECORD_STATUS.RECONCILED).withDateReconciled(null).build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    // Act / Assert
    await expect(getFeeRecordPaymentEntityGroupReconciliationData(group)).rejects.toThrow(
      new Error(`Fee records at the '${FEE_RECORD_STATUS.RECONCILED}' status cannot have a null 'dateReconciled' property`),
    );
  });

  it("returns an object containing only the 'dateReconciled' field when the most recently reconciled fee record has a null 'reconciledByUserId'", async () => {
    // Arrange
    const mostRecentlyReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport())
      .withStatus(FEE_RECORD_STATUS.RECONCILED)
      .withDateReconciled(new Date('2023'))
      .withReconciledByUserId(null)
      .build();
    const feeRecords = [
      mostRecentlyReconciledFeeRecord,
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withDateReconciled(new Date('2024'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2022'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2021'))
        .withReconciledByUserId(null)
        .build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    // Act
    const result = await getFeeRecordPaymentEntityGroupReconciliationData(group);

    // Assert
    expect(result).toEqual({ dateReconciled: new Date('2023') });
  });

  it("returns an object containing only the 'dateReconciled' field when the most recently reconciled fee record has a defined 'reconciledByUserId' but no user with that id can be found", async () => {
    // Arrange
    const tfmUserId = 'abc123';
    const mostRecentlyReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport())
      .withStatus(FEE_RECORD_STATUS.RECONCILED)
      .withDateReconciled(new Date('2023'))
      .withReconciledByUserId(tfmUserId)
      .build();
    const feeRecords = [
      mostRecentlyReconciledFeeRecord,
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withDateReconciled(new Date('2024'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2022'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2021'))
        .withReconciledByUserId(null)
        .build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    when(findTfmUserSpy).calledWith(tfmUserId).mockResolvedValue(null);

    // Act
    const result = await getFeeRecordPaymentEntityGroupReconciliationData(group);

    // Assert
    expect(result).toEqual({ dateReconciled: new Date('2023') });
  });

  it("returns an object containing the 'dateReconciled' and 'reconciledByUser' fields when the most recently reconciled fee record has a defined 'reconciledByUserId'", async () => {
    // Arrange
    const tfmUserId = 'abc123';
    const mostRecentlyReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport())
      .withStatus(FEE_RECORD_STATUS.RECONCILED)
      .withDateReconciled(new Date('2023'))
      .withReconciledByUserId(tfmUserId)
      .build();
    const feeRecords = [
      mostRecentlyReconciledFeeRecord,
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withDateReconciled(new Date('2024'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2022'))
        .withReconciledByUserId(null)
        .build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withDateReconciled(new Date('2021'))
        .withReconciledByUserId(null)
        .build(),
    ];
    const group: FeeRecordPaymentEntityGroup = { feeRecords, payments: [] };

    when(findTfmUserSpy)
      .calledWith(tfmUserId)
      .mockResolvedValue({ ...aTfmUser(), firstName: 'John', lastName: 'Smith' });

    // Act
    const result = await getFeeRecordPaymentEntityGroupReconciliationData(group);

    // Assert
    expect(result).toEqual({
      dateReconciled: new Date('2023'),
      reconciledByUser: {
        firstName: 'John',
        lastName: 'Smith',
      },
    });
  });

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});

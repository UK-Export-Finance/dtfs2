import { difference } from 'lodash';
import { when } from 'jest-when';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  FeeRecordPaymentEntityGroup,
  getFeeRecordPaymentEntityGroups,
  getFeeRecordPaymentEntityGroupStatus,
  getFeeRecordPaymentEntityGroupReconciliationData,
} from './fee-record-payment-entity-group.helper';
import { TfmUsersRepo } from '../repositories/tfm-users-repo';
import { aTfmUser } from '../../test-helpers';

describe('fee-record-payment-entity-group.helper', () => {
  const findTfmUserSpy = jest.spyOn(TfmUsersRepo, 'findOneUserById');

  beforeEach(() => {
    findTfmUserSpy.mockRejectedValue('Some error');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

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
        expect(group.feeRecords[0].id).toBe(feeRecords[index].id);
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
  });

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
      expect(result).toBe(status);
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
      expect(result).toBe(FEE_RECORD_STATUS.READY_TO_KEY);
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
  });

  describe('getFeeRecordPaymentEntityGroupReconciliationData', () => {
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
  });

  function utilisationReport(): UtilisationReportEntity {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});

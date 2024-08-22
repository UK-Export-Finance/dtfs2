import { when } from 'jest-when';
import { difference } from 'lodash';
import {
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { FeeRecordReconciledByUser } from '../../../../../types/utilisation-reports';
import { mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups } from './map-fee-record-payment-entity-groups-to-fee-record-payment-groups';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';
import { TfmUsersRepo } from '../../../../../repositories/tfm-users-repo';
import { aTfmUser } from '../../../../../../test-helpers/test-data';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  const findTfmUserSpy = jest.spyOn(TfmUsersRepo, 'findOneUserById');

  beforeEach(() => {
    findTfmUserSpy.mockRejectedValue('Some error');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups', () => {
    const NON_RECONCILED_FEE_RECORD_STATUSES = difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.RECONCILED]);

    const reconciledFeeRecordBuilder = ({
      reconciledByUserId,
      dateReconciled,
    }: {
      reconciledByUserId: string | null;
      dateReconciled: Date | null;
    }): FeeRecordEntityMockBuilder =>
      FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withReconciledByUserId(reconciledByUserId)
        .withDateReconciled(dateReconciled);

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

      it('returns as many fee record payment groups as there are fee record payment entity groups', async () => {
        // Arrange
        const groups = [
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, 'TO_DO'),
        ];

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result).toHaveLength(groups.length);
      });

      it('sets the feeRecordPaymentGroup status to the status of the fee record at the same index', async () => {
        // Arrange
        const groups = [
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(2, 'MATCH'),
          createFeeRecordEntityPaymentGroupForSingleFeeRecord(3, 'DOES_NOT_MATCH'),
        ];

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        result.forEach((group, index) => {
          expect(group.status).toBe(groups[index].feeRecords[0].status);
        });
      });

      it('sets the totalReportedPayments to the same value as the fee record reported payments', async () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].totalReportedPayments).toEqual({ currency, amount });
      });

      it('sets the paymentsReceived to null', async () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].paymentsReceived).toBeNull();
      });

      it('sets the totalPaymentsReceived to null', async () => {
        // Arrange
        const groups = [createFeeRecordEntityPaymentGroupForSingleFeeRecord(1, 'TO_DO')];

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups(groups);

        // Assert
        expect(result[0].totalPaymentsReceived).toBeNull();
      });

      it.each(NON_RECONCILED_FEE_RECORD_STATUSES)('sets the dateReconciled and reconciledByUser to null when the fee record status is %s', async (status) => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [
            FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
              .withStatus(status)
              .withDateReconciled(new Date('2024')) // this value would normally not be defined, but is being defined here for testing purposes
              .withReconciledByUserId('abc123') // this value would normally not be defined, but is being defined here for testing purposes
              .build(),
          ],
          payments: [],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].dateReconciled).toBeNull();
        expect(result[0].reconciledByUser).toBeNull();
      });

      it('maps the fee record dateReconciled and reconciledByUser when the fee record status is RECONCILED', async () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [reconciledFeeRecordBuilder({ reconciledByUserId: 'abc123', dateReconciled: new Date('2024') }).build()],
          payments: [],
        };

        when(findTfmUserSpy)
          .calledWith('abc123')
          .mockResolvedValue({ ...aTfmUser(), firstName: 'John', lastName: 'Smith' });

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].reconciledByUser).toEqual<FeeRecordReconciledByUser>({ firstName: 'John', lastName: 'Smith' });
        expect(result[0].dateReconciled).toEqual(new Date('2024'));
      });
    });

    describe('when a group has a multiple fee records and payments', () => {
      it('returns only one fee record payment group', async () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').withAmount(200).build(), PaymentEntityMockBuilder.forCurrency('GBP').withAmount(300).build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
      });

      it('sets the status to ready to key if any of the fee records have status ready to key', async () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('RECONCILED').build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe<FeeRecordStatus>('READY_TO_KEY');
      });

      it.each(NON_RECONCILED_FEE_RECORD_STATUSES)('sets the status to the status of the fee records when they all have status %s', async (status) => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        findTfmUserSpy.mockResolvedValue(aTfmUser());

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe(status);
      });

      it('sets the status to the status of the fee records when they all have status RECONCILED', async () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus(FEE_RECORD_STATUS.RECONCILED)
          .withDateReconciled(new Date('2023'))
          .build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withStatus(FEE_RECORD_STATUS.RECONCILED)
          .withDateReconciled(new Date('2023'))
          .build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        findTfmUserSpy.mockResolvedValue(aTfmUser());

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].status).toBe(FEE_RECORD_STATUS.RECONCILED);
      });

      it('returns the group with as many fee records as there are fee records in the supplied group', async () => {
        // Arrange
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build();
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [feeRecordOne, feeRecordTwo],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].feeRecords).toHaveLength(2);
      });

      it('sets the totalReportedPayments to the total of the fee record reported payments', async () => {
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
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        // 100 + 400 / 2 = 100 + 200 = 300
        const expectedTotalReportedPaymentAmount = 300;
        expect(result[0].totalReportedPayments).toEqual({ currency: 'GBP', amount: expectedTotalReportedPaymentAmount });
      });

      it('returns the group with as many paymentsReceived as there are payments in the supplied group', async () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build(), PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].paymentsReceived).toHaveLength(2);
      });

      it('sets the totalPaymentsReceived to the total of the payment amounts', async () => {
        // Arrange
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build(), FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build()],
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').withAmount(200).build(), PaymentEntityMockBuilder.forCurrency('GBP').withAmount(300).build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result[0].totalPaymentsReceived).toEqual({ currency: 'GBP', amount: 500 });
      });

      it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]))(
        'sets the dateReconciled and reconciledByUserId to null when the group status is %s',
        async (status) => {
          // Arrange
          const feeRecords = [
            // dateReconciled should normally be null but is set here for testing purposes
            FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).withDateReconciled(new Date('2024')).build(),
            FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).withDateReconciled(new Date('2024')).build(),
            FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus(status).withDateReconciled(new Date('2024')).build(),
          ];
          const group: FeeRecordPaymentEntityGroup = {
            feeRecords,
            payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
          };

          // Act
          const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

          // Assert
          expect(result).toHaveLength(1);
          expect(result[0].dateReconciled).toBeNull();
          expect(result[0].reconciledByUser).toBeNull();
        },
      );

      it('sets the dateReconciled and reconciledByUser to null when there are RECONCILED fee records in the group but one of the fee records is at the READY_TO_KEY status', async () => {
        // Arrange
        const feeRecords = [
          reconciledFeeRecordBuilder({ reconciledByUserId: 'abc123', dateReconciled: new Date('2023') }).build(),
          reconciledFeeRecordBuilder({ reconciledByUserId: 'abc123', dateReconciled: new Date('2024') }).build(),
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withStatus('READY_TO_KEY').build(),
        ];
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords,
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].dateReconciled).toBeNull();
        expect(result[0].reconciledByUser).toBeNull();
      });

      it('sets the dateReconciled and reconciledByUser to the most recently reconciled fee record when all the fee records in the group are at the RECONCILED status', async () => {
        // Arrange
        const feeRecords = [
          reconciledFeeRecordBuilder({ reconciledByUserId: 'abc123', dateReconciled: new Date('2023') }).build(),
          reconciledFeeRecordBuilder({ reconciledByUserId: 'def456', dateReconciled: new Date('2024') }).build(),
          reconciledFeeRecordBuilder({ reconciledByUserId: 'ghi789', dateReconciled: new Date('2022') }).build(),
        ];
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords,
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        when(findTfmUserSpy)
          .calledWith('def456')
          .mockResolvedValue({ ...aTfmUser(), firstName: 'John', lastName: 'Smith' });

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].reconciledByUser).toEqual<FeeRecordReconciledByUser>({ firstName: 'John', lastName: 'Smith' });
        expect(result[0].dateReconciled).toEqual(new Date('2024'));
      });

      it('sets the dateReconciled to the most recently reconciled fee record and the reconciledByUser to null when all the fee records in the group are at the RECONCILED status but the latest fee record has no defined user', async () => {
        // Arrange
        const feeRecords = [
          reconciledFeeRecordBuilder({ reconciledByUserId: 'abc123', dateReconciled: new Date('2023') }).build(),
          reconciledFeeRecordBuilder({ reconciledByUserId: 'def456', dateReconciled: new Date('2024') }).build(),
          reconciledFeeRecordBuilder({ reconciledByUserId: 'ghi789', dateReconciled: new Date('2022') }).build(),
        ];
        const group: FeeRecordPaymentEntityGroup = {
          feeRecords,
          payments: [PaymentEntityMockBuilder.forCurrency('GBP').build()],
        };

        when(findTfmUserSpy).calledWith('def456').mockResolvedValue(null);

        // Act
        const result = await mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups([group]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].reconciledByUser).toBeNull();
        expect(result[0].dateReconciled).toEqual(new Date('2024'));
      });
    });

    function aUtilisationReport(): UtilisationReportEntity {
      return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    }
  });
});

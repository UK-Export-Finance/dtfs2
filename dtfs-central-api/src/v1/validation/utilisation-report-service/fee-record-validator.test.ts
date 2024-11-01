import {
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { FeeRecordRepo } from '../../../repositories/fee-record-repo';
import { validateFeeRecordsAllHaveSamePaymentCurrency, validateFeeRecordsFormCompleteGroup } from './fee-record-validator';
import { InvalidPayloadError } from '../../../errors';

jest.mock('../../../repositories/fee-record-repo');

describe('fee record validator', () => {
  describe('validateFeeRecordsAllHaveSamePaymentCurrency', () => {
    it('does not throw if only one fee record', () => {
      // Arrange
      const feeRecords = [FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).build()];

      // Act + Assert
      expect(() => validateFeeRecordsAllHaveSamePaymentCurrency(feeRecords)).not.toThrow();
    });

    it('does not throw if no fee records provided', () => {
      // Arrange
      const feeRecords: FeeRecordEntity[] = [];

      // Act + Assert
      expect(() => validateFeeRecordsAllHaveSamePaymentCurrency(feeRecords)).not.toThrow();
    });

    it('does not throw if no all fee records have the same payment currency', () => {
      // Arrange
      const feeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('GBP')];

      // Act + Assert
      expect(() => validateFeeRecordsAllHaveSamePaymentCurrency(feeRecords)).not.toThrow();
    });

    it('throws invalid payload error if any two fee records have differing payment currency', () => {
      // Arrange
      const feeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('JPY')];

      // Act + Assert
      expect(() => validateFeeRecordsAllHaveSamePaymentCurrency(feeRecords)).toThrow(InvalidPayloadError);
    });

    function aFeeRecordWithPaymentCurrency(paymentCurrency: Currency) {
      return FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withPaymentCurrency(paymentCurrency).build();
    }
  });

  describe('validateFeeRecordsFormCompleteGroup', () => {
    const feeRecordFindBySpy = jest.spyOn(FeeRecordRepo, 'findByIdWithPaymentsAndFeeRecords');

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when all fee records in the group have the same status', () => {
      it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.DOES_NOT_MATCH]))(
        'should not throw if all the fee records in the group have status %s',
        async (status) => {
          // Arrange
          const feeRecords = [FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(1).withStatus(status).build()];
          feeRecordFindBySpy.mockResolvedValue(feeRecords);

          const feeRecordIds = [1];

          // Act + Assert
          await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).resolves.not.toThrow();
        },
      );

      describe(`when all the fee records in the group have status ${FEE_RECORD_STATUS.DOES_NOT_MATCH}`, () => {
        describe('and the fee record ids match those of the fee record payment group', () => {
          it('should not throw', async () => {
            // Arrange
            const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1), aFeeRecordWithId(2)])];
            const feeRecords = [
              aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
              aFeeRecordWithIdStatusAndPayments(2, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
            ];
            feeRecordFindBySpy.mockResolvedValue(feeRecords);

            const feeRecordIds = [1, 2];

            // Act + Assert
            await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).resolves.not.toThrow();
          });
        });

        describe('and there are missing fee record ids from the fee record payment group', () => {
          it('should throw an invalid payload error', async () => {
            // Arrange
            const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1), aFeeRecordWithId(2)])];
            const feeRecords = [aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments)];
            feeRecordFindBySpy.mockResolvedValue(feeRecords);

            const feeRecordIds = [1];

            // Act + Assert
            await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).rejects.toThrow(InvalidPayloadError);
          });
        });
      });
    });

    describe('when the fee record statuses do not match', () => {
      it('should throw an invalid payload error', async () => {
        // Arrange
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(2).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build(),
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(3).withStatus(FEE_RECORD_STATUS.MATCH).build(),
        ];
        feeRecordFindBySpy.mockResolvedValue(feeRecords);

        const feeRecordIds = [1, 2, 3];

        // Act / Assert
        await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).rejects.toThrow(InvalidPayloadError);
      });
    });

    describe('when all but one of the fee record statuses do not match', () => {
      it('should throw an invalid payload error', async () => {
        // Arrange
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(2).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build(),
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(3).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
        ];
        feeRecordFindBySpy.mockResolvedValue(feeRecords);

        const feeRecordIds = [1, 2, 3];

        // Act / Assert
        await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).rejects.toThrow(InvalidPayloadError);
      });
    });

    function aFeeRecordWithId(id: number) {
      return FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(id).build();
    }

    function aFeeRecordWithIdStatusAndPayments(id: number, status: FeeRecordStatus, payments: PaymentEntity[]) {
      return FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(id).withStatus(status).withPayments(payments).build();
    }

    function aPaymentWithFeeRecords(feeRecords: FeeRecordEntity[]) {
      return PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords(feeRecords).build();
    }
  });

  function aReconciliationInProgressReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
  }
});

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
import { FeeRecordRepo } from '../../../repositories/fee-record-repo';
import {
  validateSelectedFeeRecordsAllHaveSamePaymentCurrency,
  validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup,
} from './selected-fee-record-validator';
import { InvalidPayloadError } from '../../../errors';

jest.mock('../../../repositories/fee-record-repo');

describe('selected fee record validator', () => {
  describe('validateSelectedFeeRecordsAllHaveSamePaymentCurrency', () => {
    it('does not throw if only one fee record', () => {
      // Arrange
      const selectedFeeRecords = [FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).build()];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('does not throw if no fee records provided', () => {
      // Arrange
      const selectedFeeRecords: FeeRecordEntity[] = [];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('does not throw if no all fee records have the same payment currency', () => {
      // Arrange
      const selectedFeeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('GBP')];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).not.toThrow();
    });

    it('throws invalid payload error if any two fee records have differing payment currency', () => {
      // Arrange
      const selectedFeeRecords = [aFeeRecordWithPaymentCurrency('GBP'), aFeeRecordWithPaymentCurrency('JPY')];

      // Act + Assert
      expect(() => validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords)).toThrow(InvalidPayloadError);
    });

    function aFeeRecordWithPaymentCurrency(paymentCurrency: Currency) {
      return FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withPaymentCurrency(paymentCurrency).build();
    }
  });

  describe('validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup', () => {
    const feeRecordFindBySpy = jest.spyOn(FeeRecordRepo, 'findByIdWithPaymentsAndFeeRecords');

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe(`when the first fee record has status ${FEE_RECORD_STATUS.TO_DO}`, () => {
      it('should not throw', async () => {
        // Arrange
        const selectedFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(aReconciliationInProgressReport()).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
        ];
        feeRecordFindBySpy.mockResolvedValue(selectedFeeRecords);

        const selectedFeeRecordIds = [1];

        // Act + Assert
        await expect(validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup(selectedFeeRecordIds)).resolves.not.toThrow();
      });
    });

    describe(`when the first fee record has status ${FEE_RECORD_STATUS.DOES_NOT_MATCH}`, () => {
      describe('and the selected fee record ids match those of the fee record payment group', () => {
        it('should not throw', async () => {
          // Arrange
          const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1), aFeeRecordWithId(2)])];
          const selectedFeeRecords = [
            aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
            aFeeRecordWithIdStatusAndPayments(2, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
          ];
          feeRecordFindBySpy.mockResolvedValue(selectedFeeRecords);

          const selectedFeeRecordIds = [1, 2];

          // Act + Assert
          await expect(validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup(selectedFeeRecordIds)).resolves.not.toThrow();
        });
      });

      describe('and the selected fee record ids do not match those in the fee record payment group', () => {
        it('should throw an invalid payload error', async () => {
          // Arrange
          const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1), aFeeRecordWithId(3)])];
          const selectedFeeRecords = [
            aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
            aFeeRecordWithIdStatusAndPayments(2, FEE_RECORD_STATUS.DOES_NOT_MATCH, []),
          ];
          feeRecordFindBySpy.mockResolvedValue(selectedFeeRecords);

          const selectedFeeRecordIds = [1, 2];

          // Act + Assert
          await expect(validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup(selectedFeeRecordIds)).rejects.toThrow(InvalidPayloadError);
        });
      });

      describe('and there are missing selected fee record ids from the fee record payment group', () => {
        it('should throw an invalid payload error', async () => {
          // Arrange
          const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1)])];
          const selectedFeeRecords = [
            aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
            aFeeRecordWithIdStatusAndPayments(2, FEE_RECORD_STATUS.DOES_NOT_MATCH, []),
          ];
          feeRecordFindBySpy.mockResolvedValue(selectedFeeRecords);

          const selectedFeeRecordIds = [1, 2];

          // Act + Assert
          await expect(validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup(selectedFeeRecordIds)).rejects.toThrow(InvalidPayloadError);
        });
      });

      describe('and there are extra selected fee record ids than those in the fee record payment group', () => {
        it('should throw an invalid payload error', async () => {
          // Arrange
          const payments = [aPaymentWithFeeRecords([aFeeRecordWithId(1), aFeeRecordWithId(2), aFeeRecordWithId(3)])];
          const selectedFeeRecords = [
            aFeeRecordWithIdStatusAndPayments(1, FEE_RECORD_STATUS.DOES_NOT_MATCH, payments),
            aFeeRecordWithIdStatusAndPayments(2, FEE_RECORD_STATUS.DOES_NOT_MATCH, []),
          ];
          feeRecordFindBySpy.mockResolvedValue(selectedFeeRecords);

          const selectedFeeRecordIds = [1, 2];

          // Act + Assert
          await expect(validateSelectedFeeRecordsWithPaymentsAreOnePaymentGroup(selectedFeeRecordIds)).rejects.toThrow(InvalidPayloadError);
        });
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

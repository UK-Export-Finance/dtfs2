import {
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
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
      const feeRecords = [FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build()];

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
      return FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withPaymentCurrency(paymentCurrency).build();
    }
  });

  describe('validateFeeRecordsFormCompleteGroup', () => {
    const feeRecordFindBySpy = jest.spyOn(FeeRecordRepo, 'findByIdWithPaymentsAndFeeRecords');

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe(`when all fee records in the group have status ${FEE_RECORD_STATUS.TO_DO}`, () => {
      it('should not throw', async () => {
        // Arrange
        const payments = [
          PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
            .withFeeRecords([
              FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).build(),
              FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).build(),
            ])
            .build(),
        ];
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
            .withId(1)
            .withStatus(FEE_RECORD_STATUS.TO_DO)
            .withPayments(payments)
            .build(),
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
            .withId(2)
            .withStatus(FEE_RECORD_STATUS.TO_DO)
            .withPayments(payments)
            .build(),
        ];
        feeRecordFindBySpy.mockResolvedValue(feeRecords);

        const feeRecordIds = [1, 2];

        // Act + Assert
        await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).resolves.not.toThrow();
      });
    });

    describe.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO]))('when all fee records in the group have status %s', (status) => {
      describe('and the fee record ids match those of the fee record payment group', () => {
        it('should not throw', async () => {
          // Arrange
          const payments = [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
              .withFeeRecords([
                FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).build(),
                FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).build(),
              ])
              .build(),
          ];
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).withStatus(status).withPayments(payments).build(),
            FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).withStatus(status).withPayments(payments).build(),
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
          const payments = [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
              .withFeeRecords([
                FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).build(),
                FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).build(),
              ])
              .build(),
          ];
          const feeRecords = [
            FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).withStatus(status).withPayments(payments).build(),
          ];
          feeRecordFindBySpy.mockResolvedValue(feeRecords);

          const feeRecordIds = [1];

          // Act + Assert
          await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).rejects.toThrow(InvalidPayloadError);
        });
      });
    });

    describe('when the fee record statuses do not match', () => {
      it('should throw an invalid payload error', async () => {
        // Arrange
        const feeRecords = [
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build(),
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(3).withStatus(FEE_RECORD_STATUS.MATCH).build(),
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
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(2).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build(),
          FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).withId(3).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
        ];
        feeRecordFindBySpy.mockResolvedValue(feeRecords);

        const feeRecordIds = [1, 2, 3];

        // Act / Assert
        await expect(validateFeeRecordsFormCompleteGroup(feeRecordIds)).rejects.toThrow(InvalidPayloadError);
      });
    });
  });
});

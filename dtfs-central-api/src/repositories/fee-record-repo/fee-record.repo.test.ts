import { when } from 'jest-when';
import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { NotFoundError } from '../../errors';
import { FeeRecordRepo } from './fee-record.repo';
import { PaymentRepo } from '../payment-repo';

describe('FeeRecordRepo', () => {
  describe('findFeeRecordsAttachedToPayment', () => {
    const paymentRepoFindOneSpy = jest.spyOn(PaymentRepo, 'findOne');

    const paymentId = 1;

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('throws an error when the payment matching the supplied payment cannot be found', async () => {
      // Arrange
      when(paymentRepoFindOneSpy)
        .calledWith({ where: { id: paymentId }, relations: { feeRecords: true } })
        .mockResolvedValue(null);

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).build();

      // Act / Assert
      await expect(FeeRecordRepo.findFeeRecordsAttachedToPayment(payment)).rejects.toThrow(NotFoundError);
    });

    it('returns the attached fee records', async () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).build();

      const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords([feeRecord]).build();

      when(paymentRepoFindOneSpy)
        .calledWith({ where: { id: paymentId }, relations: { feeRecords: true } })
        .mockResolvedValue(payment);

      // Act
      const attachedFeeRecords = await FeeRecordRepo.findFeeRecordsAttachedToPayment(payment);

      // Assert
      expect(attachedFeeRecords).toEqual([feeRecord]);
    });

    function aUtilisationReport(): UtilisationReportEntity {
      return UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    }
  });
});

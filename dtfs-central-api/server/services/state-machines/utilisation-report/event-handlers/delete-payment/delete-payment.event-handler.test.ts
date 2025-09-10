import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  FeeRecordCorrectionEntityMockBuilder,
} from '@ukef/dtfs2-common/test-helpers';
import { EntityManager } from 'typeorm';
import { CURRENCY, FeeRecordEntity, PaymentEntity, RECONCILIATION_IN_PROGRESS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { handleUtilisationReportDeletePaymentEvent } from './delete-payment.event-handler';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { aDbRequestSource } from '../../../../../../test-helpers';
import { feeRecordsAndPaymentsMatch } from '../../../../../helpers/fee-record-matching';
import { FeeRecordPaymentDeletedEvent } from '../../../fee-record/event-handlers';

jest.mock('../../../../../helpers/fee-record-matching');

describe('handleUtilisationReportPaymentDeletedEvent', () => {
  const mockRemove = jest.fn();
  const mockFindOne = jest.fn();
  const mockEntityManager = {
    remove: mockRemove,
    findOne: mockFindOne,
  } as unknown as EntityManager;

  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call entityManager.findOne to fetch payment with fee records and payments attached', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const paymentId = 1;

    mockFindOne.mockResolvedValue(PaymentEntityMockBuilder.forCurrency(CURRENCY.JPY).withFeeRecords([]).build());

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockFindOne).toHaveBeenCalledWith(PaymentEntity, { where: { id: paymentId }, relations: { feeRecords: { corrections: true } } });
  });

  describe('when the payment is NOT found', () => {
    beforeEach(() => {
      when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(null);
    });

    it('should throw a NotFoundError', async () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

      // Act / Assert
      await expect(
        handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId: 1,
          requestSource: aDbRequestSource(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('when the payment is found and has no linked fee records', () => {
    const paymentId = 12;
    let paymentEntity: PaymentEntity;

    beforeEach(() => {
      paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).withFeeRecords([]).build();
      when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    });

    it('should remove payment', async () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

      // Act
      await handleUtilisationReportDeletePaymentEvent(report, {
        transactionEntityManager: mockEntityManager,
        paymentId,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith(paymentEntity);
    });
  });

  describe("when the payment is found but querying for the linked fee record and it's payments fails", () => {
    const paymentId = 12;
    const firstLinkedFeeRecordId = 13;
    const secondLinkedFeeRecordId = 14;

    let report: UtilisationReportEntity;
    let paymentEntity: PaymentEntity;
    let firstLinkedFeeRecord: FeeRecordEntity;
    let secondLinkedFeeRecord: FeeRecordEntity;

    beforeEach(() => {
      report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

      firstLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(firstLinkedFeeRecordId).build();
      secondLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(secondLinkedFeeRecordId).build();

      const linkedFeeRecords = [firstLinkedFeeRecord, secondLinkedFeeRecord];
      paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).withFeeRecords(linkedFeeRecords).build();

      when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
      when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(null);
    });

    it('should throw a NotFoundError if a fee record with the id of a fee record attached to the payment cannot be found', async () => {
      // Act / Assert
      await expect(
        handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId: 1,
          requestSource: aDbRequestSource(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('when the payment is found and has linked fee records', () => {
    const paymentId = 15;
    const firstLinkedFeeRecordId = 16;
    const secondLinkedFeeRecordId = 17;

    let report: UtilisationReportEntity;
    let paymentEntity: PaymentEntity;
    let firstLinkedFeeRecord: FeeRecordEntity;
    let secondLinkedFeeRecord: FeeRecordEntity;

    const mockEventHandlerOne = jest.fn();
    const mockEventHandlerTwo = jest.fn();
    const feeRecordStateMachineOne = aMockFeeRecordStateMachine(mockEventHandlerOne);
    const feeRecordStateMachineTwo = aMockFeeRecordStateMachine(mockEventHandlerTwo);

    beforeEach(() => {
      report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

      firstLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(firstLinkedFeeRecordId).build();
      secondLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(secondLinkedFeeRecordId).build();

      const linkedFeeRecords = [firstLinkedFeeRecord, secondLinkedFeeRecord];
      paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).withFeeRecords(linkedFeeRecords).build();

      when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
      when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(firstLinkedFeeRecord);

      jest
        .spyOn(FeeRecordStateMachine, 'forFeeRecord')
        .mockImplementation((feeRecord) => (feeRecord.id === firstLinkedFeeRecordId ? feeRecordStateMachineOne : feeRecordStateMachineTwo));

      jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);
    });

    it('should remove payment', async () => {
      // Act
      await handleUtilisationReportDeletePaymentEvent(report, {
        transactionEntityManager: mockEntityManager,
        paymentId,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith(paymentEntity);
    });

    it('should call payment deleted event for each linked fee record', async () => {
      // Act
      await handleUtilisationReportDeletePaymentEvent(report, {
        transactionEntityManager: mockEntityManager,
        paymentId,
        requestSource: aDbRequestSource(),
      });

      // Assert
      expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
      expect(mockEventHandlerOne).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_DELETED',
        }),
      );
      expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
      expect(mockEventHandlerTwo).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_DELETED',
        }),
      );
    });

    describe('when the fee records and payments match', () => {
      beforeEach(() => {
        jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(true);
      });

      it('should set feeRecordsAndPayments matched to true', async () => {
        // Act
        await handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerOne).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              feeRecordsAndPaymentsMatch: true,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );

        expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerTwo).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              feeRecordsAndPaymentsMatch: true,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );
      });
    });

    describe('when the fee records and payments do not match', () => {
      beforeEach(() => {
        jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);
      });

      it('should set feeRecordsAndPayments matched to false', async () => {
        // Act
        await handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerOne).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              feeRecordsAndPaymentsMatch: false,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );

        expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerTwo).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              feeRecordsAndPaymentsMatch: false,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );
      });
    });

    describe('when the linked fee record has attached payments after payment is deleted', () => {
      beforeEach(() => {
        const remainingAttachedPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(99999).build();

        const linkedFeeRecordEntityAfterPaymentDeletion = FeeRecordEntityMockBuilder.forReport(report)
          .withPayments([remainingAttachedPayment])
          .withId(firstLinkedFeeRecordId)
          .build();

        when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntityAfterPaymentDeletion);
      });

      it('should set hasAttachedPayments matched to true', async () => {
        // Act
        await handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerOne).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasAttachedPayments: true,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );

        expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerTwo).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasAttachedPayments: true,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );
      });
    });

    describe('when the linked fee record does not have attached payments after payment is deleted', () => {
      beforeEach(() => {
        const linkedFeeRecordEntityAfterPaymentDeletion = FeeRecordEntityMockBuilder.forReport(report).withPayments([]).withId(firstLinkedFeeRecordId).build();

        when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntityAfterPaymentDeletion);
      });

      it('should set hasAttachedPayments matched to false', async () => {
        // Act
        await handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId,
          requestSource: aDbRequestSource(),
        });

        // Assert
        expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerOne).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasAttachedPayments: false,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );

        expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerTwo).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasAttachedPayments: false,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );
      });
    });

    describe('when some of the linked fee records have corrections', () => {
      beforeEach(() => {
        firstLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(firstLinkedFeeRecordId).build();
        secondLinkedFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(secondLinkedFeeRecordId).build();

        const correctionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(firstLinkedFeeRecord, true).build();
        firstLinkedFeeRecord.corrections = [correctionEntity];

        const linkedFeeRecords = [firstLinkedFeeRecord, secondLinkedFeeRecord];
        paymentEntity = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).withFeeRecords(linkedFeeRecords).build();

        when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
        when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(firstLinkedFeeRecord);
      });

      it('should set hasCorrections to true for the fee records with corrections', async () => {
        // Act
        await handleUtilisationReportDeletePaymentEvent(report, {
          transactionEntityManager: mockEntityManager,
          paymentId,
          requestSource: aDbRequestSource(),
        });

        expect(mockEventHandlerOne).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerOne).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasCorrections: true,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );

        expect(mockEventHandlerTwo).toHaveBeenCalledTimes(1);
        expect(mockEventHandlerTwo).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              hasCorrections: false,
            }) as FeeRecordPaymentDeletedEvent,
          }),
        );
      });
    });
  });
});

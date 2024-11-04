import { EntityManager } from 'typeorm';
import {
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
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

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('throws a NotFoundError if there is no payment for that payment id', async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(null);

    // Act / Assert
    await expect(
      handleUtilisationReportDeletePaymentEvent(report, {
        transactionEntityManager: mockEntityManager,
        paymentId: 1,
        requestSource: aDbRequestSource(),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('removes payment if there are no linked fee records', async () => {
    // Arrange
    const paymentId = 12;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords([]).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockFindOne).toHaveBeenCalledWith(PaymentEntity, { where: { id: paymentId }, relations: { feeRecords: true } });
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(paymentEntity);
  });

  it('throws a NotFoundError if a fee record with the id of the fee record attached to the payment cannot be found', async () => {
    // Arrange
    const paymentId = 12;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();

    const firstFeeRecordId = 12;
    const linkedFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(firstFeeRecordId).build(),
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(firstFeeRecordId + 1)
        .build(),
    ];

    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords(linkedFeeRecords).build();

    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(null);

    // Act / Assert
    await expect(
      handleUtilisationReportDeletePaymentEvent(report, {
        transactionEntityManager: mockEntityManager,
        paymentId: 1,
        requestSource: aDbRequestSource(),
      }),
    ).rejects.toThrow(NotFoundError);
    expect(mockFindOne).toHaveBeenCalledTimes(2);
  });

  it('removes payment if there are linked fee records', async () => {
    // Arrange
    const paymentId = 123;
    const feeRecordId = 456;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const linkedFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(report).withId(feeRecordId).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords([linkedFeeRecordEntity]).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntity);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource: aDbRequestSource(),
    });

    // Assert
    expect(mockFindOne).toHaveBeenCalledTimes(2);
    expect(mockFindOne).toHaveBeenCalledWith(PaymentEntity, { where: { id: paymentId }, relations: { feeRecords: true } });
    expect(mockFindOne).toHaveBeenCalledWith(FeeRecordEntity, { where: { id: feeRecordId }, relations: { payments: true } });
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(paymentEntity);
  });

  it('handles payment deleted event for each linked fee record', async () => {
    // Arrange
    const requestSource = aDbRequestSource();
    const paymentId = 123;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const linkedFeeRecordEntityOne = FeeRecordEntityMockBuilder.forReport(report).withId(456).build();
    const linkedFeeRecordEntityTwo = FeeRecordEntityMockBuilder.forReport(report).withId(789).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
      .withId(paymentId)
      .withFeeRecords([linkedFeeRecordEntityOne, linkedFeeRecordEntityTwo])
      .build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntityOne);

    const mockEventHandlerOne = aMockEventHandler();
    const mockEventHandlerTwo = aMockEventHandler();
    const feeRecordStateMachineOne = aMockFeeRecordStateMachine(mockEventHandlerOne);
    const feeRecordStateMachineTwo = aMockFeeRecordStateMachine(mockEventHandlerTwo);

    jest
      .spyOn(FeeRecordStateMachine, 'forFeeRecord')
      .mockImplementation((feeRecord) => (feeRecord.id === linkedFeeRecordEntityOne.id ? feeRecordStateMachineOne : feeRecordStateMachineTwo));

    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource,
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

  it('sets feeRecordsAndPayments matched to true when they match', async () => {
    // Arrange
    const requestSource = aDbRequestSource();
    const paymentId = 123;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const linkedFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(report).withId(456).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords([linkedFeeRecordEntity]).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntity);

    const mockEventHandler = aMockEventHandler();
    const feeRecordStateMachine = aMockFeeRecordStateMachine(mockEventHandler);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(feeRecordStateMachine);

    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(true);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource,
    });

    // Assert
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledTimes(1);
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledWith([linkedFeeRecordEntity], linkedFeeRecordEntity.payments, mockEntityManager);
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          feeRecordsAndPaymentsMatch: true,
        }) as FeeRecordPaymentDeletedEvent,
      }),
    );
  });

  it('sets feeRecordsAndPayments matched to false when they do not match', async () => {
    // Arrange
    const requestSource = aDbRequestSource();
    const paymentId = 123;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const linkedFeeRecordEntity = FeeRecordEntityMockBuilder.forReport(report).withId(456).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withFeeRecords([linkedFeeRecordEntity]).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntity);

    const mockEventHandler = aMockEventHandler();
    const feeRecordStateMachine = aMockFeeRecordStateMachine(mockEventHandler);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(feeRecordStateMachine);

    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource,
    });

    // Assert
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledTimes(1);
    expect(feeRecordsAndPaymentsMatch).toHaveBeenCalledWith([linkedFeeRecordEntity], linkedFeeRecordEntity.payments, mockEntityManager);
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          feeRecordsAndPaymentsMatch: false,
        }) as FeeRecordPaymentDeletedEvent,
      }),
    );
  });

  it('sets hasAttachedPayments matched to true when linked fee records have attached payments after payment is deleted', async () => {
    // Arrange
    const requestSource = aDbRequestSource();
    const paymentId = 123;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
      .withId(paymentId)
      .withFeeRecords([FeeRecordEntityMockBuilder.forReport(report).withId(456).build()])
      .build();
    const linkedFeeRecordEntityAfterPaymentDeletion = FeeRecordEntityMockBuilder.forReport(report)
      .withPayments([PaymentEntityMockBuilder.forCurrency('GBP').withId(9999999).build()])
      .withId(456)
      .build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntityAfterPaymentDeletion);

    const mockEventHandler = aMockEventHandler();
    const feeRecordStateMachine = aMockFeeRecordStateMachine(mockEventHandler);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(feeRecordStateMachine);

    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource,
    });

    // Assert
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          hasAttachedPayments: true,
        }) as FeeRecordPaymentDeletedEvent,
      }),
    );
  });

  it('sets hasAttachedPayments matched to false when linked fee records have no attached payments after payment is deleted', async () => {
    // Arrange
    const requestSource = aDbRequestSource();
    const paymentId = 123;
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).build();
    const paymentEntity = PaymentEntityMockBuilder.forCurrency('GBP')
      .withId(paymentId)
      .withFeeRecords([FeeRecordEntityMockBuilder.forReport(report).withId(456).build()])
      .build();
    const linkedFeeRecordEntityAfterPaymentDeletion = FeeRecordEntityMockBuilder.forReport(report).withPayments([]).withId(456).build();
    when(mockFindOne).calledWith(PaymentEntity, expect.anything()).mockResolvedValue(paymentEntity);
    when(mockFindOne).calledWith(FeeRecordEntity, expect.anything()).mockResolvedValue(linkedFeeRecordEntityAfterPaymentDeletion);

    const mockEventHandler = aMockEventHandler();
    const feeRecordStateMachine = aMockFeeRecordStateMachine(mockEventHandler);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(feeRecordStateMachine);

    jest.mocked(feeRecordsAndPaymentsMatch).mockResolvedValue(false);

    // Act
    await handleUtilisationReportDeletePaymentEvent(report, {
      transactionEntityManager: mockEntityManager,
      paymentId,
      requestSource,
    });

    // Assert
    expect(mockEventHandler).toHaveBeenCalledTimes(1);
    expect(mockEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          hasAttachedPayments: false,
        }) as FeeRecordPaymentDeletedEvent,
      }),
    );
  });
});

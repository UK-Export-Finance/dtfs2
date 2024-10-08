import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportEditPaymentEvent } from './edit-payment.event-handler';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportAddAPaymentEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const aReconciliationInProgressReport = () => UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

  const aListOfFeeRecordsForReport = (report: UtilisationReportEntity): FeeRecordEntity[] => [
    FeeRecordEntityMockBuilder.forReport(report).withId(1).withPaymentCurrency('GBP').build(),
    FeeRecordEntityMockBuilder.forReport(report).withId(2).withPaymentCurrency('GBP').build(),
  ];

  const aPayment = () => PaymentEntityMockBuilder.forCurrency('GBP').build();

  const aMockEventHandler = () => jest.fn();
  const aMockFeeRecordStateMachine = (eventHandler: jest.Mock): FeeRecordStateMachine =>
    ({
      handleEvent: eventHandler,
    }) as unknown as FeeRecordStateMachine;

  beforeEach(() => {
    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine(aMockEventHandler()));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('updates and saves the payment entity using the supplied entity manager', async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();
    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);

    const newPaymentAmount = 200;
    const newDatePaymentReceived = new Date('2024-01-01');
    const newPaymentReference = 'A new payment reference';

    const payment = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(100).withDateReceived(new Date('2023-12-01')).withReference(undefined).build();

    // Act
    await handleUtilisationReportEditPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      payment,
      feeRecords,
      paymentAmount: newPaymentAmount,
      datePaymentReceived: newDatePaymentReceived,
      paymentReference: newPaymentReference,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(PaymentEntity, payment);
    expect(payment.amount).toBe(newPaymentAmount);
    expect(payment.dateReceived).toBe(newDatePaymentReceived);
    expect(payment.reference).toBe(newPaymentReference);
  });

  it('calls the fee record state machine event handler for each fee record in the payload', async () => {
    // Arrange
    const payment = PaymentEntityMockBuilder.forCurrency('GBP').build();

    const utilisationReport = aReconciliationInProgressReport();
    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    // Act
    await handleUtilisationReportEditPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      payment,
      paymentAmount: 100,
      datePaymentReceived: new Date(),
      paymentReference: undefined,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'PAYMENT_EDITED',
        payload: {
          transactionEntityManager: mockEntityManager,
          feeRecordsAndPaymentsMatch: false,
          requestSource,
        },
      });
    });
  });

  it("calls the fee record state machine event handler with 'feeRecordsAndPaymentsMatch' set to true if the fee records match the payments", async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(true);

    // Act
    await handleUtilisationReportEditPaymentEvent(utilisationReport, {
      ...aSetOfPayloadPaymentValues(),
      transactionEntityManager: mockEntityManager,
      feeRecords,
      payment: aPayment(),
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_EDITED',
          payload: expect.objectContaining({
            feeRecordsAndPaymentsMatch: true,
          }) as { feeRecordsAndPaymentsMatch: boolean },
        }),
      );
    });
  });

  it("calls the fee record state machine event handler with 'feeRecordsAndPaymentsMatch' set to false if the fee records do not match the payments", async () => {
    // Arrange
    const utilisationReport = aReconciliationInProgressReport();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);

    // Act
    await handleUtilisationReportEditPaymentEvent(utilisationReport, {
      ...aSetOfPayloadPaymentValues(),
      transactionEntityManager: mockEntityManager,
      payment: aPayment(),
      feeRecords,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_EDITED',
          payload: expect.objectContaining({
            feeRecordsAndPaymentsMatch: false,
          }) as { feeRecordsAndPaymentsMatch: boolean },
        }),
      );
    });
  });

  it('updates and saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    // Act
    await handleUtilisationReportEditPaymentEvent(utilisationReport, {
      ...aSetOfPayloadPaymentValues(),
      transactionEntityManager: mockEntityManager,
      feeRecords: aListOfFeeRecordsForReport(utilisationReport),
      payment: aPayment(),
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
    expect(utilisationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(utilisationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(utilisationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });

  function aSetOfPayloadPaymentValues() {
    return {
      paymentAmount: 100,
      datePaymentReceived: new Date(),
      paymentReference: undefined,
    };
  }
});

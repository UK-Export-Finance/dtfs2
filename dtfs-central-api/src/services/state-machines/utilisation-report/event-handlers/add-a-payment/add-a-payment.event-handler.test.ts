import { EntityManager } from 'typeorm';
import {
  Currency,
  DbRequestSource,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  REQUEST_PLATFORM_TYPE,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportAddAPaymentEvent } from './add-a-payment.event-handler';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from '../helpers';

jest.mock('../helpers');

describe('handleUtilisationReportAddAPaymentEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId: tfmUserId,
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  const paymentCurrency: Currency = 'GBP';
  const paymentDetails: NewPaymentDetails = {
    currency: paymentCurrency,
    amount: 100,
    dateReceived: new Date(),
    reference: 'A payment reference',
  };

  const aListOfFeeRecordsForReport = (report: UtilisationReportEntity): FeeRecordEntity[] => [
    FeeRecordEntityMockBuilder.forReport(report).withId(1).withPaymentCurrency(paymentCurrency).build(),
    FeeRecordEntityMockBuilder.forReport(report).withId(2).withPaymentCurrency(paymentCurrency).build(),
  ];

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

  it('creates and saves the new payment entity using the supplied entity manager', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);

    const newPaymentEntity = PaymentEntity.create({
      ...paymentDetails,
      feeRecords,
      requestSource,
    });

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(PaymentEntity, newPaymentEntity);
  });

  it('calls the fee record state machine event handler for each fee record in the payload', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'PAYMENT_ADDED',
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
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(true);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_ADDED',
          payload: expect.objectContaining({
            feeRecordsAndPaymentsMatch: true,
          }) as { feeRecordsAndPaymentsMatch: boolean },
        }),
      );
    });
  });

  it("calls the fee record state machine event handler with 'feeRecordsAndPaymentsMatch' set to false if the fee records do not match the payments", async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const eventHandlers = feeRecords.reduce((obj, { id }) => ({ ...obj, [id]: aMockEventHandler() }), {} as { [id: number]: jest.Mock });
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine(eventHandlers[id]) }),
      {} as { [id: number]: FeeRecordStateMachine },
    );

    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockImplementation((feeRecord) => feeRecordStateMachines[feeRecord.id]);

    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    feeRecords.forEach(({ id }) => {
      const eventHandler = eventHandlers[id];
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_ADDED',
          payload: expect.objectContaining({
            feeRecordsAndPaymentsMatch: false,
          }) as { feeRecordsAndPaymentsMatch: boolean },
        }),
      );
    });
  });

  it('saves the updated report', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
  });

  it(`only updates the report audit fields if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}'`, async () => {
    // Arrange
    const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus(
      UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS,
    ).build();

    const feeRecords = aListOfFeeRecordsForReport(reconciliationInProgressReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(reconciliationInProgressReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(reconciliationInProgressReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(reconciliationInProgressReport.lastUpdatedByPortalUserId).toBeNull();
    expect(reconciliationInProgressReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });

  it(`updates the report audit fields and status if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, async () => {
    // Arrange
    const pendingReconciliationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();

    const feeRecords = aListOfFeeRecordsForReport(pendingReconciliationReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(pendingReconciliationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(pendingReconciliationReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(pendingReconciliationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(pendingReconciliationReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
    expect(pendingReconciliationReport.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS);
  });
});

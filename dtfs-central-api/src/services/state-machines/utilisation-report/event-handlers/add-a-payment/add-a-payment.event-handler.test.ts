import { EntityManager } from 'typeorm';
import {
  Currency,
  DbRequestSource,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportAddAPaymentEvent } from './add-a-payment.event-handler';
import { NewPaymentDetails } from '../../../../../types/utilisation-reports';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';
import { feeRecordsMatchAttachedPayments } from './helpers';

jest.mock('./helpers');

describe('handleUtilisationReportAddAPaymentEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const mockEntityManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  const paymentCurrency: Currency = 'GBP';
  const paymentDetails: NewPaymentDetails = {
    currency: paymentCurrency,
    amountReceived: 100,
    dateReceived: new Date(),
    paymentReference: 'A payment reference',
  };

  const aListOfFeeRecordsForReport = (report: UtilisationReportEntity): FeeRecordEntity[] => [
    FeeRecordEntityMockBuilder.forReport(report).withId(1).withPaymentCurrency(paymentCurrency).build(),
    FeeRecordEntityMockBuilder.forReport(report).withId(2).withPaymentCurrency(paymentCurrency).build(),
  ];

  beforeEach(() => {
    jest.mocked(feeRecordsMatchAttachedPayments).mockResolvedValue(false);
    jest.spyOn(FeeRecordStateMachine, 'forFeeRecord').mockReturnValue(aMockFeeRecordStateMachine());
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('creates and saves the new payment entity using the supplied entity manager', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

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
    expect(mockEntityManager.save).toHaveBeenCalledWith(PaymentEntity, newPaymentEntity);
  });

  it('calls the fee record state machine event handler for each fee record in the payload', async () => {
    // Arrange
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMachines = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine() }),
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
    feeRecords.forEach((feeRecord) => {
      const eventHandler = feeRecordStateMachines[feeRecord.id].handleEvent;
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
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMachines: { [id: number]: FeeRecordStateMachine } = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine() }),
      {},
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
    feeRecords.forEach((feeRecord) => {
      const eventHandler = feeRecordStateMachines[feeRecord.id].handleEvent;
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
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);
    const feeRecordStateMachines: { [id: number]: FeeRecordStateMachine } = feeRecords.reduce(
      (stateMachines, { id }) => ({ ...stateMachines, [id]: aMockFeeRecordStateMachine() }),
      {},
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
    feeRecords.forEach((feeRecord) => {
      const eventHandler = feeRecordStateMachines[feeRecord.id].handleEvent;
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
    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(utilisationReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(utilisationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(mockEntityManager.save).toHaveBeenCalledWith(UtilisationReportEntity, utilisationReport);
  });

  it(`only updates the report audit fields if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}'`, async () => {
    // Arrange
    const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    const feeRecords = aListOfFeeRecordsForReport(reconciliationInProgressReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(reconciliationInProgressReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(reconciliationInProgressReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(reconciliationInProgressReport.lastUpdatedByPortalUserId).toBeNull();
    expect(reconciliationInProgressReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });

  it(`updates the report audit fields and status if the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, async () => {
    // Arrange
    const pendingReconciliationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

    const feeRecords = aListOfFeeRecordsForReport(pendingReconciliationReport);

    // Act
    await handleUtilisationReportAddAPaymentEvent(pendingReconciliationReport, {
      transactionEntityManager: mockEntityManager,
      feeRecords,
      paymentDetails,
      requestSource,
    });

    // Assert
    expect(pendingReconciliationReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(pendingReconciliationReport.lastUpdatedByPortalUserId).toBeNull();
    expect(pendingReconciliationReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
    expect(pendingReconciliationReport.status).toBe(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS);
  });

  function aMockFeeRecordStateMachine(): FeeRecordStateMachine {
    return {
      handleEvent: jest.fn(),
    } as unknown as FeeRecordStateMachine;
  }
});
